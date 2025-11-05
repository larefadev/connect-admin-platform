import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '@/lib/Supabase';
import { useAuthStore } from '@/stores/authStore';
import { Product } from '../interface/Product';
import { ProductStats } from '../interface/Product';
import { useQueryCache } from '../../../hooks/useQueryCache';

// Interface for RPC product results
interface RPCProductResult {
  sku: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  brand_code?: string;
  description?: string;
  category?: string;
  provider_sku?: string;
  is_visible?: boolean;
  [key: string]: unknown;
}

// Interface for product with potential provider_sku
interface ProductWithProviderSku extends Product {
  provider_sku?: string;
}

// Interface for product filters
export interface ProductFilters {
  search?: string;
  brand?: string;
  brand_code?: string;
  model?: string;
  motorization?: string;
  assembly_plant?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({});
  const { isAuthenticated } = useAuthStore();
  const { getCachedData, setCachedData, hasCachedData, invalidateCache } = useQueryCache();

  // Función para obtener stock total agrupado por product_sku
  const fetchProductsStock = useCallback(async (productSkus: string[]): Promise<Map<string, number>> => {
    if (productSkus.length === 0) {
      return new Map();
    }

    try {
      // Dividir en lotes de 100 SKUs para evitar límites de URL/query
      const BATCH_SIZE = 100;
      const stockMap = new Map<string, number>();
      
      for (let i = 0; i < productSkus.length; i += BATCH_SIZE) {
        const batch = productSkus.slice(i, i + BATCH_SIZE);
        
        const { data, error } = await supabase
          .from('inventory')
          .select('product_sku, stock')
          .in('product_sku', batch);

        if (error) {
          console.error('❌ Error al obtener stock:', error);
          // Continuar con el siguiente lote en lugar de fallar completamente
          continue;
        }

        // Agrupar y sumar el stock por product_sku
        (data || []).forEach((item: { product_sku: string; stock: number }) => {
          const currentStock = stockMap.get(item.product_sku) || 0;
          stockMap.set(item.product_sku, currentStock + (item.stock || 0));
        });
      }

      // Asegurar que todos los SKUs tengan al menos 0
      productSkus.forEach(sku => {
        if (!stockMap.has(sku)) {
          stockMap.set(sku, 0);
        }
      });

      console.log('✅ Stock obtenido para', stockMap.size, 'productos');
      return stockMap;
    } catch (err) {
      console.error('❌ Error al obtener stock:', err);
      return new Map();
    }
  }, []);

  // Carga inicial con caché
  const loadProducts = useCallback(async () => {
    const cacheKey = 'products_initial';

    // Verificar caché primero (15 minutos TTL)
    if (hasCachedData(cacheKey)) {
      const cachedProducts = getCachedData<Product[]>(cacheKey);
      if (cachedProducts) {
        setProducts(cachedProducts);
        setFilteredProducts(cachedProducts);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando productos iniciales...');

      // Usar función RPC optimizada para carga inicial
      const { data: productsData, error } = await supabase
        .rpc('get_products_with_compat_flex', {
          p_assembly_plant: null,
          p_brand: null,
          p_model: null,
          p_motorization: null,
          p_sku: null,
          p_year: null,
          p_provider_sku: null, // NUEVO parámetro
        });

      if (error) {
        console.error('❌ Error de Supabase RPC:', error);
        throw error;
      }

      const products = (productsData || []).map((p: Record<string, unknown>) => ({
        SKU: String(p.sku || ''),
        name: String(p.name || ''),
        price: Number(p.price || 0),
        image: String(p.image || '/placeholder-product.png'),
        brand: String(p.brand || ''),
        brand_code: String(p.brand_code || ''),
        description: String(p.description || ''),
        category: String(p.category || ''),
        provider: String(p.provider || ''),
        provider_id: Number(p.provider_id || 0),
        provider_sku: p.provider_sku ? String(p.provider_sku) : undefined,
        is_visible: p.is_visible !== undefined ? Boolean(p.is_visible) : true, // Default true si no está definido
      }));

      // Obtener stock para todos los productos
      const productSkus = products.map((p: Product) => p.SKU);
      const stockMap = await fetchProductsStock(productSkus);

      // Agregar stock a cada producto
      const productsWithStock = products.map((product: Product) => ({
        ...product,
        totalStock: stockMap.get(product.SKU) || 0,
      }));

      console.log('✅ Productos cargados:', productsWithStock.length);
      setProducts(productsWithStock);
      setFilteredProducts(productsWithStock);

      // Guardar en caché por 15 minutos
      setCachedData(cacheKey, productsWithStock, 15 * 60 * 1000);

    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, hasCachedData, fetchProductsStock]);

  // Función para refrescar productos (invalida cache y recarga)
  const refreshProducts = useCallback(async () => {
    console.log('🔄 Refrescando productos...');
    invalidateCache('products_initial');
    await loadProducts();
  }, [invalidateCache, loadProducts]);

  // Sistema de búsqueda híbrida
  const searchProductsByText = useCallback(async (searchTerm: string, brandFilter?: string, limit: number = 50) => {
    const trimmedSearch = searchTerm.trim();

    try {
      console.log('🔍 Buscando productos:', { término: trimmedSearch, límite: limit, marca: brandFilter });

      // DETECCIÓN INTELIGENTE DE PROVIDER_SKU
      // Regex que identifica términos que podrían ser provider_sku:
      // - Solo caracteres alfanuméricos (A-Z, a-z, 0-9)
      // - Sin guiones, espacios o caracteresAndroid especiales
      // - Mínimo 4 caracteres de longitud
      const couldBeProviderSku = /^[A-Za-z0-9]+$/.test(trimmedSearch) && trimmedSearch.length >= 4;
      
      console.log('🔎 Análisis del término:', { 
        término: trimmedSearch, 
        podríaSerProviderSKU: couldBeProviderSku 
      });

      // ESTRATEGIA PRINCIPAL: Si parece provider_sku, usar función RPC
      if (couldBeProviderSku) {
        console.log('🎯 Usando función RPC con p_provider_sku para traer cross references');
        
        try {
          // Llamada RPC que incluye automáticamente cross references
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_products_with_compat_flex', {
            p_provider_sku: trimmedSearch,  // Parámetro clave para cross references
            p_brand: brandFilter || null,
            p_assembly_plant: null,
            p_model: null,
            p_motorization: null,
            p_sku: null,
            p_year: null,
            p_auto_part_type_code: null,
          });

          if (rpcError) {
            console.warn('⚠️ Error en búsqueda RPC por provider_sku:', rpcError);
            // Continuar con búsqueda híbrida normal como fallback
          } else if (rpcData && rpcData.length > 0) {
            console.log('✅ Productos encontrados por provider_sku (incluye cross references):', {
              total: rpcData.length,
              productos: rpcData.map((p: RPCProductResult) => ({ sku: p.sku, name: p.name, brand: p.brand }))
            });
            
            // Mapear resultados RPC al formato esperado por el frontend
            const rpcResults = rpcData.map((p: RPCProductResult) => ({
              SKU: p.sku,
              sku: p.sku,
              provider_sku: p.provider_sku,  // Incluir provider_sku en resultado
              name: p.name,
              price: p.price,
              image: p.image,
              brand: p.brand,
              brand_code: p.brand_code || '',
              description: p.description || '',
              category: p.category || '',
              is_visible: p.is_visible !== undefined ? Boolean(p.is_visible) : true
            }));
            
            // Obtener stock para estos productos
            const rpcSkus = rpcResults.map((p: ProductWithProviderSku) => (p.SKU || p.sku || '')).filter(Boolean) as string[];
            const stockMap = await fetchProductsStock(rpcSkus);
            
            // Agregar stock a cada producto
            const rpcResultsWithStock = rpcResults.map((product: ProductWithProviderSku) => ({
              ...product,
              totalStock: stockMap.get(String(product.SKU || product.sku || '')) || 0,
            }));
            
            // Retornar resultados que incluyen cross references automáticamente
            return rpcResultsWithStock.slice(0, limit);
          }
        } catch (rpcError) {
          console.error('❌ Error en llamada RPC:', rpcError);
          // Continuar con búsqueda híbrida normal como fallback
        }
      }

      // ESTRATEGIA FALLBACK: Búsqueda híbrida normal (local + BD)
      // Se ejecuta si:
      // 1. El término NO parece provider_sku
      // 2. La llamada RPC falló
      // 3. No se encontraron resultados por provider_sku
      
      const searchLower = trimmedSearch.toLowerCase();
      
      // PASO 1: Búsqueda local en productos ya cargados (instantáneo)
      const localResults = products.filter(product => {
        const matchesBrand = !brandFilter || product.brand === brandFilter;
        if (!matchesBrand) return false;
        
        const sku = (product.SKU || '').toLowerCase();
        const providerSku = ((product as ProductWithProviderSku).provider_sku || '').toLowerCase(); // NUEVO
        const name = (product.name || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        
        return (
          // Coincidencia exacta en nombre principal (máxima prioridad)
          name === searchLower ||
          // Nombre principal empieza con el término
          name.startsWith(searchLower) ||
          // Nombre principal contiene el término como palabra completa
          name.split(' ').some(word => word === searchLower) ||
          // Coincidencia exacta en SKU
          sku === searchLower ||
          // Coincidencia exacta en provider_sku (NUEVO)
          providerSku === searchLower ||
          // Coincidencia exacta en marca
          brand === searchLower
        );
      });

      // Si tenemos suficientes resultados locales, obtener stock y retornar
      if (localResults.length >= 20) {
        const sortedResults = sortAndLimitResults(localResults, trimmedSearch.toLowerCase(), limit) as ProductWithProviderSku[];
        const resultSkus = sortedResults.map((p: ProductWithProviderSku) => (p.SKU || p.sku || '')).filter(Boolean) as string[];
        const stockMap = await fetchProductsStock(resultSkus);
        return sortedResults.map((product: ProductWithProviderSku) => ({
          ...product,
          totalStock: stockMap.get(String(product.SKU || product.sku || '')) || 0,
        }));
      }

      // PASO 2: Si no hay suficientes resultados locales, buscar en BD
      const skuPromise = supabase
        .from('products_test')
        .select('SKU, name, price, image, brand, description, category, provider_sku, is_visible')
        .ilike('SKU', `${trimmedSearch}%`)
        .limit(30);

      const namePromise = supabase
        .from('products_test')
        .select('SKU, name, price, image, brand, description, category, provider_sku, is_visible')
        .ilike('name', `${trimmedSearch}%`)
        .limit(30);

      // NUEVA búsqueda por provider_sku
      const providerSkuPromise = supabase
        .from('products_test')
        .select('SKU, name, price, image, brand, description, category, provider_sku, is_visible')
        .ilike('provider_sku', `${trimmedSearch}%`)
        .limit(30);

      // Ejecutar búsquedas en paralelo
      const results = await Promise.all([skuPromise, namePromise, providerSkuPromise]);
      
      // Combinar resultados de BD con resultados locales
      const bdResults = results.flatMap(result => result.data || []);
      const allProducts = [...localResults, ...bdResults];
      
      const sortedResults = sortAndLimitResults(allProducts, trimmedSearch.toLowerCase(), limit) as ProductWithProviderSku[];
      const resultSkus = sortedResults.map((p: ProductWithProviderSku) => (p.SKU || p.sku || '')).filter(Boolean) as string[];
      const stockMap = await fetchProductsStock(resultSkus);
      return sortedResults.map((product: ProductWithProviderSku) => ({
        ...product,
        totalStock: stockMap.get(String(product.SKU || product.sku || '')) || 0,
      }));
    } catch (error) {
      console.error('❌ Error en búsqueda de productos:', error);
      return [];
    }
  }, [products, fetchProductsStock]);

  // Función de ordenamiento y limitación de resultados
  const sortAndLimitResults = useCallback((productsArray: Record<string, unknown>[], searchLower: string, limit: number) => {
    const sortedProducts = productsArray.sort((a, b) => {
      const aName = String(a.name || '').toLowerCase();
      const bName = String(b.name || '').toLowerCase();
      const aSku = String((a.sku || a.SKU) || '').toLowerCase();
      const bSku = String((b.sku || b.SKU) || '').toLowerCase();
      const aProviderSku = String((a.provider_sku || '') || '').toLowerCase(); // NUEVO
      const bProviderSku = String((b.provider_sku || '') || '').toLowerCase(); // NUEVO
      const aBrand = String(a.brand || '').toLowerCase();
      const bBrand = String(b.brand || '').toLowerCase();

      // 🎯 LÓGICA DE PRIORIZACIÓN MEJORADA

      // Prioridad 1: Nombre coincide exactamente (MÁXIMA PRIORIDAD)
      if (aName === searchLower) return -1;
      if (bName === searchLower) return 1;

      // Prioridad 2: SKU coincide exactamente
      if (aSku === searchLower) return -1;
      if (bSku === searchLower) return 1;

      // Prioridad 2.5: Provider SKU coincide exactamente (NUEVO)
      if (aProviderSku === searchLower) return -1;
      if (bProviderSku === searchLower) return 1;

      // Prioridad 3: Nombre empieza con el término (ALTA PRIORIDAD)
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
      if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;

      // Prioridad 4: Nombre contiene el término como palabra completa
      const aHasWord = aName.split(' ').some((word: string) => word === searchLower);
      const bHasWord = bName.split(' ').some((word: string) => word === searchLower);
      if (aHasWord && !bHasWord) return -1;
      if (!aHasWord && bHasWord) return 1;

      // Prioridad 5: SKU empieza con el término
      if (aSku.startsWith(searchLower) && !bSku.startsWith(searchLower)) return -1;
      if (!aSku.startsWith(searchLower) && bSku.startsWith(searchLower)) return 1;

      // Prioridad 5.5: Provider SKU empieza con el término (NUEVO)
      if (aProviderSku.startsWith(searchLower) && !bProviderSku.startsWith(searchLower)) return -1;
      if (!aProviderSku.startsWith(searchLower) && bProviderSku.startsWith(searchLower)) return 1;

      // Prioridad 6: Marca coincide exactamente
      if (aBrand === searchLower) return -1;
      if (bBrand === searchLower) return 1;

      // Por defecto: orden alfabético por nombre
      return aName.localeCompare(bName);
    });

    return sortedProducts.slice(0, limit);
  }, []);

  // Sistema de filtrado inteligente
  const filterProducts = useCallback(async (filters: ProductFilters) => {
    setCurrentFilters(filters);
    setFiltering(true);
    setError(null);

    try {
      // Verificar tipo de filtros para optimizar consulta
      const hasCompatibilityFilters = Boolean(
        filters.assembly_plant || 
        filters.model || 
        filters.motorization
      );

      const hasSearchTerm = filters.search && filters.search.trim() !== '';
      const hasBasicFilters = Boolean(filters.brand || filters.category);

      console.log('🔍 Analizando filtros:', {
        filters,
        hasCompatibilityFilters,
        hasSearchTerm,
        hasBasicFilters,
        brandFilter: filters.brand
      });

      let filteredData: Product[];

      if (hasSearchTerm) {
        // Usar función compartida de búsqueda (consulta directa optimizada)
        const searchResults = await searchProductsByText(filters.search!, filters.brand);
        filteredData = searchResults.map((product: Product) => ({
          SKU: String(product.SKU || product.sku || ''),
          name: String(product.name || ''),
          price: Number(product.price || 0),
          image: String(product.image || '/placeholder-product.png'),
          brand: String(product.brand || ''),
          brand_code: String(product.brand_code || ''),
          description: String(product.description || ''),
          category: String(product.category || ''),
          provider: String(product.provider || ''),
          provider_id: Number(product.provider_id || 0),
          provider_sku: product.provider_sku ? String(product.provider_sku) : undefined,
          is_visible: product.is_visible !== undefined ? Boolean(product.is_visible) : true,
          totalStock: Number(product.totalStock || 0), // Stock ya viene de searchProductsByText
        }));
      } else if (hasCompatibilityFilters) {
        // Usar función RPC cuando hay filtros de compatibilidad
        const { data, error } = await supabase
          .rpc('get_products_with_compat_flex', {
            p_assembly_plant: filters.assembly_plant || null,
            p_brand: filters.brand || null,
            p_model: filters.model || null,
            p_motorization: filters.motorization || null,
            p_sku: null,
            p_year: null,
            p_provider_sku: null, // NUEVO parámetro
          });

        if (error) throw error;

        // Deduplicar por SKU cuando se usan filtros de compatibilidad
        const productsMap = new Map<string, Product>();
        (data || []).forEach((product: Record<string, unknown>) => {
          if (!productsMap.has(String(product.sku))) {
            productsMap.set(String(product.sku), {
              SKU: String(product.sku || ''),
              name: String(product.name || ''),
              price: Number(product.price || 0),
              image: String(product.image || '/placeholder-product.png'),
              brand: String(product.brand || ''),
              brand_code: String(product.brand_code || ''),
              description: String(product.description || ''),
              category: String(product.category || ''),
              provider: String(product.provider || ''),
              provider_id: Number(product.provider_id || 0),
              provider_sku: product.provider_sku ? String(product.provider_sku) : undefined,
              is_visible: product.is_visible !== undefined ? Boolean(product.is_visible) : true
            });
          }
        });
        filteredData = Array.from(productsMap.values());
      } else if (hasBasicFilters) {
        // Para filtros básicos como marca, usar la función RPC para obtener resultados completos
        console.log('🎯 Ejecutando búsqueda por filtros básicos (marca/categoría):', {
          brand: filters.brand,
          category: filters.category
        });
        
        const { data, error } = await supabase
          .rpc('get_products_with_compat_flex', {
            p_assembly_plant: null,
            p_brand: filters.brand || null,
            p_model: null,
            p_motorization: null,
            p_sku: null,
            p_year: null,
            p_provider_sku: null, // NUEVO parámetro
          });

        if (error) throw error;

        // Mapear los resultados de la función RPC
        filteredData = (data || []).map((product: Record<string, unknown>) => ({
          SKU: String(product.sku || ''),
          name: String(product.name || ''),
          price: Number(product.price || 0),
          image: String(product.image || '/placeholder-product.png'),
          brand: String(product.brand || ''),
          brand_code: String(product.brand_code || ''),
          description: String(product.description || ''),
          category: String(product.category || ''),
          provider: String(product.provider || ''),
          provider_id: Number(product.provider_id || 0),
          provider_sku: product.provider_sku ? String(product.provider_sku) : undefined,
          is_visible: product.is_visible !== undefined ? Boolean(product.is_visible) : true
        }));

        // Si hay filtro de categoría adicional, aplicarlo localmente
        if (filters.category) {
          filteredData = filteredData.filter(product => product.category === filters.category);
        }

        console.log('✅ Resultados obtenidos de la función RPC:', {
          totalResults: filteredData.length,
          sampleResults: filteredData.slice(0, 3).map(p => ({ sku: p.SKU, name: p.name, brand: p.brand }))
        });
      } else {
        // Sin filtros: mostrar todos los productos cargados
        filteredData = products;
      }

      // Obtener stock para los productos filtrados (excepto si ya viene de búsqueda)
      let filteredDataWithStock: Product[];
      if (hasSearchTerm) {
        // El stock ya viene incluido en searchProductsByText
        filteredDataWithStock = filteredData;
      } else {
        const filteredSkus = filteredData.map(p => p.SKU);
        const stockMap = await fetchProductsStock(filteredSkus);

        // Agregar stock a cada producto filtrado
        filteredDataWithStock = filteredData.map(product => ({
          ...product,
          totalStock: stockMap.get(product.SKU) || product.totalStock || 0,
        }));
      }

      setFilteredProducts(filteredDataWithStock);
    } catch (err) {
      console.error('❌ Error al filtrar productos:', err);
      setError(err instanceof Error ? err.message : 'Error al filtrar productos');
      setFilteredProducts(products);
    } finally {
      setFiltering(false);
    }
  }, [products, searchProductsByText, fetchProductsStock]);

  // Obtener estadísticas de productos
  const getProductStats = useCallback(async (): Promise<ProductStats> => {
    try {
      const { data: products, error: productsError } = await supabase
        .from('products_test')
        .select('SKU, name, price, category');

      if (productsError) {
        console.warn('Error fetching products:', productsError);
        return {
          totalProducts: 0,
          totalCategories: 0,
          averagePrice: 0,
          topProducts: []
        };
      }

      const uniqueCategories = products ?
        [...new Set(products.map(p => p.category).filter(Boolean))] : [];

      const totalProducts = products?.length || 0;
      const totalCategories = uniqueCategories.length;
      const averagePrice = totalProducts > 0
        ? products.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts
        : 0;

      // Simular top products (en una implementación real, esto vendría de una tabla de ventas)
      const topProducts = products?.slice(0, 5).map((product) => ({
        name: product.name || 'Producto sin nombre',
        sales: Math.floor(Math.random() * 300) + 50, // Simulado
        revenue: `$${((Math.random() * 20000) + 1000).toFixed(0)}` // Simulado
      })) || [];

      return {
        totalProducts,
        totalCategories,
        averagePrice,
        topProducts
      };
    } catch (err) {
      console.error('Error fetching product stats:', err);
      return {
        totalProducts: 0,
        totalCategories: 0,
        averagePrice: 0,
        topProducts: []
      };
    }
  }, []);

  // Crear producto
  const createProduct = useCallback(async (productData: Omit<Product, 'SKU'> & { SKU?: string }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Creando producto:', productData);

      const newProduct = {
        SKU: productData.SKU || `SKU-${Date.now()}`,
        name: productData.name,
        price: productData.price,
        image: productData.image || null,
        brand: productData.brand || null,
        brand_code: productData.brand_code || null,
        description: productData.description || null,
        category: productData.category || null,
        provider: productData.provider || null,
        provider_id: productData.provider_id || null
      };

      // Insertar en Supabase
      const { error } = await supabase
        .from('products_test')
        .insert([newProduct]);

      if (error) {
        console.error('❌ Error de Supabase al crear producto:', error);
        throw error;
      }

      console.log('✅ Producto creado exitosamente en BD');

      // Invalidar caché de productos
      invalidateCache('products_initial');

      // Recargar productos para reflejar el cambio
      await loadProducts();

      // Si hay filtros activos, reaplicarlos
      if (Object.keys(currentFilters).length > 0) {
        await filterProducts(currentFilters);
      }

    } catch (err) {
      console.error('❌ Error al crear producto:', err);
      setError(err instanceof Error ? err.message : 'Error al crear producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, currentFilters, filterProducts, invalidateCache]);

  const deleteProduct = useCallback(async (productSKU: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Eliminando producto:', productSKU);

      // Eliminar inventario primero (por foreign key constraints)
      const { error: inventoryError } = await supabase
        .from('inventory')
        .delete()
        .eq('product_sku', productSKU);

      if (inventoryError) {
        console.error('❌ Error al eliminar inventario:', inventoryError);
        throw inventoryError;
      }

      // Eliminar producto
      const { error: productError } = await supabase
        .from('products_test')
        .delete()
        .eq('SKU', productSKU);

      if (productError) {
        console.error('❌ Error al eliminar producto:', productError);
        throw productError;
      }

      console.log('✅ Producto eliminado exitosamente');

      // Invalidar caché de productos
      invalidateCache('products_initial');

      // Recargar productos para reflejar el cambio
      await loadProducts();

      // Si hay filtros activos, reaplicarlos
      if (Object.keys(currentFilters).length > 0) {
        await filterProducts(currentFilters);
      }

    } catch (err) {
      console.error('❌ Error al eliminar producto:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, currentFilters, filterProducts])


  const updateProduct = useCallback(async (productSKU: string, productData: Product) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Actualizando producto:', productSKU, productData);

      const { error } = await supabase
        .from('products_test')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image || null,
          category: productData.category || null,
          brand: productData.brand || null,
          brand_code: productData.brand_code || null,
          provider: productData.provider || null,
          provider_id: productData.provider_id || null
        })
        .eq('SKU', productData.SKU);

      if (error) {
        console.error('❌ Error de Supabase al actualizar producto:', error);
        throw error;
      }

      console.log('✅ Producto actualizado exitosamente');

      // Invalidar caché de productos
      invalidateCache('products_initial');

      // Recargar productos para reflejar el cambio
      await loadProducts();

      // Si hay filtros activos, reaplicarlos
      if (Object.keys(currentFilters).length > 0) {
        await filterProducts(currentFilters);
      }

    } catch (err) {
      console.error('❌ Error al actualizar producto:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, currentFilters, filterProducts, invalidateCache])

  // Función para activar/desactivar producto (toggle is_visible)
  const toggleProductVisibility = useCallback(async (productSKU: string, currentVisibility: boolean) => {
    setError(null);

    try {
      const newVisibility = !currentVisibility;
      console.log('🔄 Cambiando visibilidad del producto:', productSKU, 'de', currentVisibility, 'a', newVisibility);

      // Actualización optimista: actualizar el estado local inmediatamente
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.SKU === productSKU 
            ? { ...product, is_visible: newVisibility }
            : product
        )
      );

      setFilteredProducts(prevFiltered => 
        prevFiltered.map(product => 
          product.SKU === productSKU 
            ? { ...product, is_visible: newVisibility }
            : product
        )
      );

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('products_test')
        .update({ is_visible: newVisibility })
        .eq('SKU', productSKU);

      if (error) {
        console.error('❌ Error de Supabase al cambiar visibilidad:', error);
        // Revertir la actualización optimista en caso de error
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.SKU === productSKU 
              ? { ...product, is_visible: currentVisibility }
              : product
          )
        );

        setFilteredProducts(prevFiltered => 
          prevFiltered.map(product => 
            product.SKU === productSKU 
              ? { ...product, is_visible: currentVisibility }
              : product
          )
        );
        throw error;
      }

      console.log('✅ Visibilidad del producto actualizada exitosamente');

      // Invalidar caché de productos
      invalidateCache('products_initial');

    } catch (err) {
      console.error('❌ Error al cambiar visibilidad del producto:', err);
      setError(err instanceof Error ? err.message : 'Error al cambiar visibilidad del producto');
      throw err;
    }
  }, [invalidateCache])

  const bulkStockUpdate = useCallback(async (
    updates: { provider_sku: string; provider_branch_id: number; stock: number; reserved_stock?: number }[],
    onProgress?: (progress: { current: number; total: number; updated: number; created: number; skipped: number }) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    // Retornar una Promise que se resuelve cuando termine el proceso en segundo plano
    return new Promise((resolve, reject) => {
      // Ejecutar en segundo plano sin bloquear la UI
      (async () => {
        try {
          console.log('🔄 Actualizando stock masivamente por provider_sku:', updates.length, 'registros');

          const errors: string[] = [];
          let updatedCount = 0;
          let createdCount = 0;
          let skippedCount = 0;
          let currentIndex = 0;

          // Procesar cada actualización
          for (const update of updates) {
            // Verificar si la operación fue cancelada
            if (signal?.aborted) {
              // No hacer log aquí, será manejado por el catch del modal
              const cancelError = new DOMException('Actualización cancelada por el usuario', 'AbortError');
              reject(cancelError);
              return;
            }

            currentIndex++;
            try {
              // 1. Buscar si existe registro en inventory con este provider_sku y provider_branch_id
              const { data: existingInventory, error: inventoryError } = await supabase
                .from('inventory')
                .select('id, product_sku')
                .eq('provider_sku', update.provider_sku)
                .eq('provider_branch_id', update.provider_branch_id)
                .maybeSingle();

              if (inventoryError) {
                console.error(`❌ Error buscando inventory para ${update.provider_sku}:`, inventoryError);
                errors.push(`Provider SKU ${update.provider_sku}: Error al buscar en inventario`);
                skippedCount++;
                // Notificar progreso
                if (onProgress) {
                  onProgress({
                    current: currentIndex,
                    total: updates.length,
                    updated: updatedCount,
                    created: createdCount,
                    skipped: skippedCount
                  });
                }
                continue;
              }

              if (existingInventory) {
                // 2a. Si existe, actualizar el registro
                const { error: updateError } = await supabase
                  .from('inventory')
                  .update({
                    stock: update.stock,
                    reserved_stock: update.reserved_stock || 0,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', existingInventory.id);

                if (updateError) {
                  console.error(`❌ Error actualizando inventory para ${update.provider_sku}:`, updateError);
                  errors.push(`Provider SKU ${update.provider_sku}: Error al actualizar inventario`);
                  skippedCount++;
                } else {
                  updatedCount++;
                }
              } else {
                // 2b. Si no existe, buscar producto en products_test por provider_sku
                const { data: product, error: productError } = await supabase
                  .from('products_test')
                  .select('SKU')
                  .eq('provider_sku', update.provider_sku)
                  .maybeSingle();

                if (productError) {
                  console.error(`❌ Error buscando producto para ${update.provider_sku}:`, productError);
                  errors.push(`Provider SKU ${update.provider_sku}: Error al buscar producto`);
                  skippedCount++;
                  // Notificar progreso
                  if (onProgress) {
                    onProgress({
                      current: currentIndex,
                      total: updates.length,
                      updated: updatedCount,
                      created: createdCount,
                      skipped: skippedCount
                    });
                  }
                  continue;
                }

                if (!product) {
                  // 3. Si no se encuentra el producto, saltar
                  console.warn(`⚠️ Producto no encontrado para provider_sku: ${update.provider_sku}`);
                  errors.push(`Provider SKU ${update.provider_sku}: Producto no encontrado en products_test`);
                  skippedCount++;
                  // Notificar progreso
                  if (onProgress) {
                    onProgress({
                      current: currentIndex,
                      total: updates.length,
                      updated: updatedCount,
                      created: createdCount,
                      skipped: skippedCount
                    });
                  }
                  continue;
                }

                // 4. Si se encuentra el producto, crear nuevo registro en inventory
                const { error: insertError } = await supabase
                  .from('inventory')
                  .insert({
                    product_sku: product.SKU,
                    provider_branch_id: update.provider_branch_id,
                    stock: update.stock,
                    reserved_stock: update.reserved_stock || 0,
                    provider_sku: update.provider_sku,
                    updated_at: new Date().toISOString()
                  });

                if (insertError) {
                  console.error(`❌ Error creando inventory para ${update.provider_sku}:`, insertError);
                  errors.push(`Provider SKU ${update.provider_sku}: Error al crear registro en inventario`);
                  skippedCount++;
                } else {
                  createdCount++;
                }
              }

              // Notificar progreso después de cada registro procesado
              if (onProgress) {
                onProgress({
                  current: currentIndex,
                  total: updates.length,
                  updated: updatedCount,
                  created: createdCount,
                  skipped: skippedCount
                });
              }
            } catch (err) {
              console.error(`❌ Error procesando ${update.provider_sku}:`, err);
              errors.push(`Provider SKU ${update.provider_sku}: Error inesperado`);
              skippedCount++;
              // Notificar progreso incluso en caso de error
              if (onProgress) {
                onProgress({
                  current: currentIndex,
                  total: updates.length,
                  updated: updatedCount,
                  created: createdCount,
                  skipped: skippedCount
                });
              }
            }
          }

          console.log('✅ Stock actualizado:', {
            actualizados: updatedCount,
            creados: createdCount,
            omitidos: skippedCount,
            total: updates.length
          });

          // Notificación final
          if (onProgress) {
            onProgress({
              current: updates.length,
              total: updates.length,
              updated: updatedCount,
              created: createdCount,
              skipped: skippedCount
            });
          }

          // Resolver la Promise exitosamente
          resolve();

        } catch (err) {
          // No hacer log de cancelaciones (AbortError)
          const isCancelled = err instanceof DOMException && err.name === 'AbortError' ||
                             err instanceof Error && err.name === 'AbortError';
          
          if (!isCancelled) {
            console.error('❌ Error al actualizar stock masivamente:', err);
          }
          
          // Notificar error final si hay callback
          if (onProgress) {
            onProgress({
              current: updates.length,
              total: updates.length,
              updated: 0,
              created: 0,
              skipped: updates.length
            });
          }
          // Rechazar la Promise en caso de error
          reject(err);
        }
      })();
    });
  }, [])

  const bulkImport = useCallback(async (products: Product[]) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Importando productos masivamente:', products.length, 'productos');

      const { error } = await supabase
        .from('products_test')
        .insert(products);

      if (error) {
        console.error('❌ Error de Supabase al importar productos:', error);
        throw error;
      }

      console.log('✅ Productos importados exitosamente');

      // Invalidar caché de productos
      invalidateCache('products_initial');

      // Recargar productos para reflejar el cambio
      await loadProducts();

      // Si hay filtros activos, reaplicarlos
      if (Object.keys(currentFilters).length > 0) {
        await filterProducts(currentFilters);
      }

    } catch (err) {
      console.error('❌ Error al importar productos masivamente:', err);
      setError(err instanceof Error ? err.message : 'Error al importar productos masivamente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, currentFilters, filterProducts])


  // Función de fallback que busca en productos ya cargados
  const getLocalSuggestions = useCallback((searchTerm: string) => {
    if (!products || products.length === 0) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    const filtered = products
      .filter(product => 
        (product.name && String(product.name).toLowerCase().includes(term)) ||
        (product.SKU && String(product.SKU).toLowerCase().includes(term)) ||
        (product.brand && String(product.brand).toLowerCase().includes(term)) ||
        ((product as ProductWithProviderSku).provider_sku && String((product as ProductWithProviderSku).provider_sku).toLowerCase().includes(term)) // NUEVO
      )
      .slice(0, 8)
      .map(product => ({
        sku: String(product.SKU || ''),
        name: String(product.name || ''),
        brand: String(product.brand || ''),
        price: Number(product.price || 0),
        image: String(product.image || '/placeholder-product.png')
      }));

    return filtered;
  }, [products]);

  // Get search suggestions con timeout y fallback
  const getSearchSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    try {
      // Usar un timeout más corto para evitar bloqueos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), 5000); // 5 segundos timeout
      });

      const searchPromise = supabase
        .rpc('get_search_suggestions', {
          p_search_term: searchTerm,
          p_limit: 8
        });

      const { data: suggestions, error } = await Promise.race([searchPromise, timeoutPromise]) as { data: Record<string, unknown>[] | null; error: Error | null };

      if (error) {
        console.error('Error getting search suggestions:', error);
        // Fallback: buscar en productos ya cargados
        return getLocalSuggestions(searchTerm);
      }

      // La nueva función ya retorna el formato correcto
      return (suggestions || []).map((product: Record<string, unknown>) => ({
        sku: String(product.sku || ''),
        name: String(product.name || ''),
        brand: String(product.brand || ''),
        price: Number(product.price || 0),
        image: String(product.image || '/placeholder-product.png')
      }));
    } catch (err) {
      console.error('Error getting search suggestions:', err);
      // Fallback: buscar en productos ya cargados
      return getLocalSuggestions(searchTerm);
    }
  }, [getLocalSuggestions]);

  // Función de búsqueda de productos
  const searchProducts = useCallback(async (searchTerm: string) => {
    await filterProducts({ search: searchTerm });
  }, [filterProducts]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setCurrentFilters({});
    setFilteredProducts(products);
  }, [products]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    } else {
      setProducts([]);
      setFilteredProducts([]);
      setError(null);
      setCurrentPage(1);
    }
  }, [isAuthenticated, loadProducts]);

  // Calcular productos paginados
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  }, [filteredProducts.length, itemsPerPage]);

  return {
    // Productos
    products,
    filteredProducts,
    paginatedProducts,
    loading,
    filtering,
    error,
    
    // Paginación
    totalItems: filteredProducts.length,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
    
    // Filtros
    currentFilters,
    
    // Funciones de búsqueda y filtrado
    filterProducts,
    searchProducts,
    getSearchSuggestions,
    clearFilters,
    refreshProducts,
    
    // Funciones CRUD
    getProductStats,
    createProduct,
    deleteProduct,
    updateProduct,
    toggleProductVisibility,
    bulkStockUpdate,
    bulkImport,
  };
};

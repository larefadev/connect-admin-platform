import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '@/lib/Supabase';
import { useAuthStore } from '@/stores/authStore';
import { Product } from '../interface/Product';
import { ProductStats } from '../interface/Product';
import { useQueryCache } from '../../../hooks/useQueryCache';


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
      }));

      console.log('✅ Productos cargados:', products.length);
      setProducts(products);
      setFilteredProducts(products);

      // Guardar en caché por 15 minutos
      setCachedData(cacheKey, products, 15 * 60 * 1000);

    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, hasCachedData]);

  // Sistema de búsqueda híbrida
  const searchProductsByText = useCallback(async (searchTerm: string, brandFilter?: string, limit: number = 50) => {
    const trimmedSearch = searchTerm.trim();
    
    // PASO 1: Búsqueda local en productos ya cargados (instantáneo)
    const localResults = products.filter(product => {
      const matchesBrand = !brandFilter || product.brand === brandFilter;
      if (!matchesBrand) return false;
      
      const sku = (product.SKU || '').toLowerCase();
      const name = (product.name || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const searchLower = trimmedSearch.toLowerCase();
      
      return (
        // Coincidencia exacta en nombre principal (máxima prioridad)
        name === searchLower ||
        // Nombre principal empieza con el término
        name.startsWith(searchLower) ||
        // Nombre principal contiene el término como palabra completa
        name.split(' ').some(word => word === searchLower) ||
        // Coincidencia exacta en SKU
        sku === searchLower ||
        // Coincidencia exacta en marca
        brand === searchLower
      );
    });

    // Si tenemos suficientes resultados locales, usarlos directamente
    if (localResults.length >= 20) {
      return sortAndLimitResults(localResults, trimmedSearch.toLowerCase(), limit);
    }

    // PASO 2: Si no hay suficientes resultados locales, buscar en BD
    const skuPromise = supabase
      .from('products_test')
      .select('SKU, name, price, image, brand, description, category')
      .ilike('SKU', `${trimmedSearch}%`)
      .limit(30);

    const namePromise = supabase
      .from('products_test')
      .select('SKU, name, price, image, brand, description, category')
      .ilike('name', `${trimmedSearch}%`)
      .limit(30);

    // Ejecutar búsquedas en paralelo
    const results = await Promise.all([skuPromise, namePromise]);
    
    // Combinar resultados de BD con resultados locales
    const bdResults = results.flatMap(result => result.data || []);
    const allProducts = [...localResults, ...bdResults];
    
    return sortAndLimitResults(allProducts, trimmedSearch.toLowerCase(), limit);
  }, [products]);

  // Función de ordenamiento y limitación de resultados
  const sortAndLimitResults = useCallback((productsArray: Record<string, unknown>[], searchLower: string, limit: number) => {
    const sortedProducts = productsArray.sort((a, b) => {
      const aName = String(a.name || '').toLowerCase();
      const bName = String(b.name || '').toLowerCase();
      const aSku = String((a.sku || a.SKU) || '').toLowerCase();
      const bSku = String((b.sku || b.SKU) || '').toLowerCase();
      const aBrand = String(a.brand || '').toLowerCase();
      const bBrand = String(b.brand || '').toLowerCase();

      // 🎯 LÓGICA DE PRIORIZACIÓN MEJORADA

      // Prioridad 1: Nombre coincide exactamente (MÁXIMA PRIORIDAD)
      if (aName === searchLower) return -1;
      if (bName === searchLower) return 1;

      // Prioridad 2: SKU coincide exactamente
      if (aSku === searchLower) return -1;
      if (bSku === searchLower) return 1;

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
        filteredData = searchResults.map(product => ({
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

      setFilteredProducts(filteredData);
    } catch (err) {
      console.error('❌ Error al filtrar productos:', err);
      setError(err instanceof Error ? err.message : 'Error al filtrar productos');
      setFilteredProducts(products);
    } finally {
      setFiltering(false);
    }
  }, [products, searchProductsByText]);

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
  }, [loadProducts, currentFilters, filterProducts])

  const bulkStockUpdate = useCallback(async (updates: { product_sku: string; provider_branch_id: number; stock: number; reserved_stock?: number }[]) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Actualizando stock masivamente:', updates);

      const { error } = await supabase
        .from('inventory')
        .upsert(updates);

      if (error) {
        console.error('❌ Error de Supabase al actualizar stock:', error);
        throw error;
      }

      console.log('✅ Stock actualizado exitosamente');

      // Recargar productos para reflejar cambios en el inventario
      await loadProducts();

      // Si hay filtros activos, reaplicarlos
      if (Object.keys(currentFilters).length > 0) {
        await filterProducts(currentFilters);
      }

    } catch (err) {
      console.error('❌ Error al actualizar stock masivamente:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar stock masivamente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, currentFilters, filterProducts])

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
        (product.brand && String(product.brand).toLowerCase().includes(term))
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
    
    // Funciones CRUD
    getProductStats,
    createProduct,
    deleteProduct,
    updateProduct,
    bulkStockUpdate,
    bulkImport,
  };
};

import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/Supabase';

export interface Product {
  SKU: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  brand_code?: string;
  description?: string;
  category?: string;
  provider?: string;
  provider_id?: number;
  [key: string]: unknown;
}

export interface ProductStats {
  totalProducts: number;
  totalCategories: number;
  averagePrice: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: string;
  }>;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos con límite para dashboard
  const loadProducts = useCallback(async (limit: number = 100) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando productos para dashboard...');
      
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

      const products = (productsData || []).slice(0, limit).map((p: Record<string, unknown>) => ({
        SKU: p.SKU || p.sku || '',
        name: p.name || '',
        price: p.price || 0,
        image: p.image || '',
        brand: p.brand || '',
        brand_code: p.brand_code || '',
        description: p.description || '',
        category: p.category || '',
        provider: p.provider || '',
        provider_id: p.provider_id || 0,
      }));
      
      console.log('✅ Productos cargados para dashboard:', products.length);
      setProducts(products);
    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Cargar productos al inicializar
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Crear producto
  const createProduct = useCallback(async (productData: Omit<Product, 'SKU'> & { SKU?: string }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Creando producto:', productData);
      
      // For now, we'll simulate the creation since we don't have the full backend implementation
      // In a real implementation, this would call the Supabase API
      const newProduct: Product = {
        SKU: productData.SKU || `SKU-${Date.now()}`,
        name: productData.name as string,
        price: productData.price as number,
        image: productData.image as string | undefined,
        brand: productData.brand as string | undefined,
        brand_code: productData.brand_code as string | undefined,
        description: productData.description as string | undefined,
        category: productData.category as string | undefined,
        provider: productData.provider as string | undefined,
        provider_id: productData.provider_id as number | undefined
      };

      // Add to local state (in a real app, this would be handled by the backend)
      setProducts(prev => [newProduct, ...prev]);
      
      console.log('✅ Producto creado exitosamente');
    } catch (err) {
      console.error('❌ Error al crear producto:', err);
      setError(err instanceof Error ? err.message : 'Error al crear producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    loadProducts,
    getProductStats,
    createProduct,
  };
};

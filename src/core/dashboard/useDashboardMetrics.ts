import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/Supabase';

export interface DashboardMetrics {
  // Métricas de productos
  totalProducts: number;
  totalCategories: number;
  averagePrice: number;
  
  // Métricas de pedidos
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  pendingOrders: number;
  completedOrders: number;
  
  // Métricas de clientes
  totalCustomers: number;
  newCustomersThisMonth: number;
  
  // Métricas de cotizaciones
  totalQuotes: number;
  pendingQuotes: number;
  completedQuotes: number;
}

export const useDashboardMetrics = (storeId?: number) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    totalCategories: 0,
    averagePrice: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageTicket: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    completedQuotes: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener métricas de productos
  const fetchProductMetrics = useCallback(async () => {
    try {
      // Usar la tabla products_test que realmente existe
      const { data: products, error: productsError } = await supabase
        .from('products_test')
        .select('SKU, price, category');

      if (productsError) {
        console.warn('Error fetching products:', productsError);
        return { totalProducts: 0, totalCategories: 0, averagePrice: 0 };
      }

      // Obtener categorías únicas de los productos
      const uniqueCategories = products ? 
        [...new Set(products.map(p => p.category).filter(Boolean))] : [];

      const totalProducts = products?.length || 0;
      const totalCategories = uniqueCategories.length;
      const averagePrice = totalProducts > 0 
        ? products.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts 
        : 0;

      return { totalProducts, totalCategories, averagePrice };
    } catch (err) {
      console.error('Error fetching product metrics:', err);
      return { totalProducts: 0, totalCategories: 0, averagePrice: 0 };
    }
  }, []);

  // Función para obtener métricas de pedidos
  const fetchOrderMetrics = useCallback(async (storeIdParam: number) => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders_test')
        .select('id, total_amount, order_status, payment_status, created_at')
        .eq('store_id', storeIdParam);

      if (ordersError) throw ordersError;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = orders?.filter(order => order.order_status === 'pending').length || 0;
      const completedOrders = orders?.filter(order => order.order_status === 'delivered').length || 0;

      return {
        totalOrders,
        totalRevenue,
        averageTicket,
        pendingOrders,
        completedOrders
      };
    } catch (err) {
      console.error('Error fetching order metrics:', err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageTicket: 0,
        pendingOrders: 0,
        completedOrders: 0
      };
    }
  }, []);

  // Función para obtener métricas de clientes
  const fetchCustomerMetrics = useCallback(async (storeIdParam: number) => {
    try {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, created_at')
        .eq('store_id', storeIdParam);

      if (customersError) throw customersError;

      const totalCustomers = customers?.length || 0;

      // Calcular nuevos clientes este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const { data: newCustomers, error: newCustomersError } = await supabase
        .from('customers')
        .select('id')
        .eq('store_id', storeIdParam)
        .gte('created_at', thisMonth.toISOString());

      if (newCustomersError) throw newCustomersError;

      const newCustomersThisMonth = newCustomers?.length || 0;

      return { totalCustomers, newCustomersThisMonth };
    } catch (err) {
      console.error('Error fetching customer metrics:', err);
      return { totalCustomers: 0, newCustomersThisMonth: 0 };
    }
  }, []);

  // Función para obtener métricas de cotizaciones
  const fetchQuoteMetrics = useCallback(async (storeIdParam: number) => {
    try {
      // Usar la consulta que funciona en useQuotes
      const { data: quotes, error: quotesError } = await supabase
        .from('product_quote_test')
        .select(`
          id,
          status,
          created_at,
          company:company_quote_test!inner(*)
        `)
        .eq('company.store_id', storeIdParam);

      if (quotesError) {
        console.warn('Error fetching quotes:', quotesError);
        return {
          totalQuotes: 0,
          pendingQuotes: 0,
          completedQuotes: 0
        };
      }

      const totalQuotes = quotes?.length || 0;
      const pendingQuotes = quotes?.filter(quote => quote.status === 'pending').length || 0;
      const completedQuotes = quotes?.filter(quote => quote.status === 'completed').length || 0;

      return {
        totalQuotes,
        pendingQuotes,
        completedQuotes
      };
    } catch (err) {
      console.error('Error fetching quote metrics:', err);
      return {
        totalQuotes: 0,
        pendingQuotes: 0,
        completedQuotes: 0
      };
    }
  }, []);

  // Función principal para cargar todas las métricas
  const fetchMetrics = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    setError(null);

    try {
      const [productMetrics, orderMetrics, customerMetrics, quoteMetrics] = await Promise.all([
        fetchProductMetrics(),
        fetchOrderMetrics(storeId),
        fetchCustomerMetrics(storeId),
        fetchQuoteMetrics(storeId)
      ]);

      setMetrics({
        ...productMetrics,
        ...orderMetrics,
        ...customerMetrics,
        ...quoteMetrics
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId, fetchProductMetrics, fetchOrderMetrics, fetchCustomerMetrics, fetchQuoteMetrics]);

  // Cargar métricas cuando cambie la tienda
  useEffect(() => {
    if (storeId) {
      fetchMetrics();
    }
  }, [storeId, fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};

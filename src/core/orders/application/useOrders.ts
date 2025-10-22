import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/Supabase';

export interface Order {
  id: number;
  store_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
  }>;
}

export const useOrders = (storeId?: number) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar órdenes por tienda
  const loadOrders = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Cargando órdenes para tienda:', storeId);

      const { data, error: ordersError } = await supabase
        .from('orders_test')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      console.log('✅ Órdenes cargadas:', data?.length || 0);
      setOrders(data || []);
    } catch (err) {
      console.error('❌ Error al cargar órdenes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Obtener estadísticas de órdenes
  const getOrderStats = useCallback(async (): Promise<OrderStats> => {
    if (!storeId) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageTicket: 0,
        pendingOrders: 0,
        completedOrders: 0,
        recentOrders: []
      };
    }

    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders_test')
        .select('id, customer_name, total_amount, order_status, payment_status, created_at')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = orders?.filter(order => order.order_status === 'pending').length || 0;
      const completedOrders = orders?.filter(order => order.order_status === 'delivered').length || 0;

      // Formatear órdenes recientes para el dashboard
      const recentOrders = orders?.slice(0, 5).map(order => ({
        id: `#${order.id}`,
        customer: order.customer_name || 'Cliente desconocido',
        amount: `$${order.total_amount?.toFixed(2) || '0.00'}`,
        status: getStatusLabel(order.order_status),
        date: new Date(order.created_at).toLocaleDateString('es-ES')
      })) || [];

      return {
        totalOrders,
        totalRevenue,
        averageTicket,
        pendingOrders,
        completedOrders,
        recentOrders
      };
    } catch (err) {
      console.error('Error fetching order stats:', err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageTicket: 0,
        pendingOrders: 0,
        completedOrders: 0,
        recentOrders: []
      };
    }
  }, [storeId]);

  // Función auxiliar para obtener etiquetas de estado
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Completado',
      cancelled: 'Cancelado'
    };
    return statusLabels[status] || status;
  };

  // Obtener órdenes por estado
  const getOrdersByStatus = useCallback((status: Order['order_status']) => {
    return orders.filter(order => order.order_status === status);
  }, [orders]);

  // Cargar órdenes al inicializar o cuando cambie storeId
  useEffect(() => {
    if (storeId) {
      loadOrders();
    }
  }, [storeId, loadOrders]);

  return {
    orders,
    loading,
    error,
    loadOrders,
    getOrderStats,
    getOrdersByStatus,
  };
};

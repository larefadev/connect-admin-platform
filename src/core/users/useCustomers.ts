import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/Supabase';

export interface Customer {
  id: number;
  store_id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: Array<{
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: string;
  }>;
}

export const useCustomers = (storeId?: number) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar clientes por tienda
  const loadCustomers = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Cargando clientes para tienda:', storeId);

      const { data, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      console.log('✅ Clientes cargados:', data?.length || 0);
      setCustomers(data || []);
    } catch (err) {
      console.error('❌ Error al cargar clientes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Obtener estadísticas de clientes
  const getCustomerStats = useCallback(async (): Promise<CustomerStats> => {
    if (!storeId) {
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        topCustomers: []
      };
    }

    try {
      // Obtener todos los clientes
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, email, created_at')
        .eq('store_id', storeId);

      if (customersError) throw customersError;

      const totalCustomers = customers?.length || 0;

      // Calcular nuevos clientes este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const { data: newCustomers, error: newCustomersError } = await supabase
        .from('customers')
        .select('id')
        .eq('store_id', storeId)
        .gte('created_at', thisMonth.toISOString());

      if (newCustomersError) throw newCustomersError;

      const newCustomersThisMonth = newCustomers?.length || 0;

      // Simular top customers (en una implementación real, esto vendría de un join con orders)
      const topCustomers = customers?.slice(0, 5).map((customer) => ({
        name: customer.name || 'Cliente desconocido',
        email: customer.email || '',
        totalOrders: Math.floor(Math.random() * 20) + 1, // Simulado
        totalSpent: `$${((Math.random() * 5000) + 100).toFixed(0)}` // Simulado
      })) || [];

      return {
        totalCustomers,
        newCustomersThisMonth,
        topCustomers
      };
    } catch (err) {
      console.error('Error fetching customer stats:', err);
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        topCustomers: []
      };
    }
  }, [storeId]);

  // Buscar clientes
  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (!storeId || !searchTerm.trim()) {
      loadCustomers();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (searchError) throw searchError;

      setCustomers(data || []);
    } catch (err) {
      console.error('Error searching customers:', err);
      setError(err instanceof Error ? err.message : 'Error en la búsqueda de clientes');
    } finally {
      setLoading(false);
    }
  }, [storeId, loadCustomers]);

  // Cargar clientes al inicializar o cuando cambie storeId
  useEffect(() => {
    if (storeId) {
      loadCustomers();
    }
  }, [storeId, loadCustomers]);

  return {
    customers,
    loading,
    error,
    loadCustomers,
    getCustomerStats,
    searchCustomers,
  };
};

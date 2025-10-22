import { useState, useCallback, useEffect } from 'react';
import supabase from '@/lib/Supabase';
import { Provider, CreateProviderData, UpdateProviderData } from './Entities/Provider';

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los proveedores
  const getProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setProviders(data || []);
    } catch (err) {
      setError('Error al obtener proveedores');
      console.error('Error en getProviders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener proveedor por ID
  const getProviderById = useCallback(async (providerId: bigint): Promise<Provider> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error) throw error;

      return data as Provider;
    } catch (err) {
      setError('Error al obtener el proveedor');
      console.error('Error en getProviderById:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo proveedor
  const createProvider = useCallback(async (providerData: CreateProviderData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider')
        .insert([providerData])
        .select()
        .single();

      if (error) throw error;

      // Agregar al estado local
      setProviders(prev => [...prev, data]);
      return true;
    } catch (err) {
      setError('Error al crear el proveedor');
      console.error('Error en createProvider:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar proveedor
  const updateProvider = useCallback(async (providerData: UpdateProviderData): Promise<boolean> => {
    if (!providerData.id) return false;

    setLoading(true);
    setError(null);
    try {
      const { id, ...updateData } = providerData;
      
      const { data, error } = await supabase
        .from('provider')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado local
      setProviders(prev => prev.map(provider => 
        provider.id === id ? data : provider
      ));

      return true;
    } catch (err) {
      setError('Error al actualizar el proveedor');
      console.error('Error en updateProvider:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar proveedor
  const deleteProvider = useCallback(async (providerId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('provider')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      // Actualizar el estado local
      setProviders(prev => prev.filter(provider => provider.id !== providerId));
      return true;
    } catch (err) {
      setError('Error al eliminar el proveedor');
      console.error('Error en deleteProvider:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar proveedores
  const searchProviders = useCallback(async (searchTerm: string): Promise<Provider[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,representative.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError('Error al buscar proveedores');
      console.error('Error en searchProviders:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de proveedores
  const getProviderStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('provider')
        .select('id, city, state, email');

      if (error) throw error;

      const totalProviders = data?.length || 0;
      const uniqueCities = new Set(data?.map(p => p.city).filter(Boolean)).size;
      const uniqueStates = new Set(data?.map(p => p.state).filter(Boolean)).size;

      return {
        totalProviders,
        uniqueCities,
        uniqueStates,
        providersWithEmail: data?.filter(p => p.email).length || 0
      };
    } catch (err) {
      console.error('Error en getProviderStats:', err);
      return {
        totalProviders: 0,
        uniqueCities: 0,
        uniqueStates: 0,
        providersWithEmail: 0
      };
    }
  }, []);

  // Cargar proveedores al inicializar
  useEffect(() => {
    getProviders();
  }, [getProviders]);

  return {
    providers,
    loading,
    error,
    getProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
    searchProviders,
    getProviderStats
  };
};

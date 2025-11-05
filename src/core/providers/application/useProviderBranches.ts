import { useState, useCallback, useEffect } from 'react';
import supabase from '@/lib/Supabase';
import { ProviderBranch, CreateProviderBranchData, UpdateProviderBranchData } from '../interfaces/ProviderBranch';

export const useProviderBranches = (providerId?: bigint) => {
  const [branches, setBranches] = useState<ProviderBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las sucursales de un proveedor
  const getBranchesByProvider = useCallback(async (providerIdParam?: bigint) => {
    const targetProviderId = providerIdParam || providerId;
    if (!targetProviderId) return [];

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider_branches')
        .select('*')
        .eq('provider_id', targetProviderId)
        .order('is_main_branch', { ascending: false })
        .order('branch_name', { ascending: true });

      if (error) throw error;

      const branchesData = data || [];
      setBranches(branchesData);
      return branchesData;
    } catch (err) {
      setError('Error al obtener las sucursales');
      console.error('Error en getBranchesByProvider:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  // Obtener sucursal por ID
  const getBranchById = useCallback(async (branchId: number): Promise<ProviderBranch | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider_branches')
        .select('*')
        .eq('id', branchId)
        .single();

      if (error) throw error;

      return data as ProviderBranch;
    } catch (err) {
      setError('Error al obtener la sucursal');
      console.error('Error en getBranchById:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva sucursal
  const createBranch = useCallback(async (branchData: CreateProviderBranchData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Si es sucursal principal, desactivar otras sucursales principales del mismo proveedor
      if (branchData.is_main_branch) {
        await supabase
          .from('provider_branches')
          .update({ is_main_branch: false })
          .eq('provider_id', branchData.provider_id)
          .eq('is_main_branch', true);
      }

      const { data, error } = await supabase
        .from('provider_branches')
        .insert([{
          ...branchData,
          is_main_branch: branchData.is_main_branch || false,
          is_active: branchData.is_active !== undefined ? branchData.is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado local
      setBranches(prev => [...prev, data]);
      return true;
    } catch (err) {
      setError('Error al crear la sucursal');
      console.error('Error en createBranch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar sucursal
  const updateBranch = useCallback(async (branchData: UpdateProviderBranchData): Promise<boolean> => {
    if (!branchData.id) return false;

    setLoading(true);
    setError(null);
    try {
      const { id, ...updateData } = branchData;

      // Si se está marcando como sucursal principal, desactivar otras sucursales principales
      if (updateData.is_main_branch && updateData.provider_id) {
        await supabase
          .from('provider_branches')
          .update({ is_main_branch: false })
          .eq('provider_id', updateData.provider_id)
          .eq('is_main_branch', true)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('provider_branches')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado local
      setBranches(prev => prev.map(branch => 
        branch.id === id ? data : branch
      ));

      return true;
    } catch (err) {
      setError('Error al actualizar la sucursal');
      console.error('Error en updateBranch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar sucursal
  const deleteBranch = useCallback(async (branchId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('provider_branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;

      // Actualizar el estado local
      setBranches(prev => prev.filter(branch => branch.id !== branchId));
      return true;
    } catch (err) {
      setError('Error al eliminar la sucursal');
      console.error('Error en deleteBranch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Activar/desactivar sucursal
  const toggleBranchStatus = useCallback(async (branchId: number, isActive: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider_branches')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', branchId)
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado local
      setBranches(prev => prev.map(branch => 
        branch.id === branchId ? data : branch
      ));

      return true;
    } catch (err) {
      setError('Error al cambiar el estado de la sucursal');
      console.error('Error en toggleBranchStatus:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Establecer sucursal principal
  const setMainBranch = useCallback(async (branchId: number, providerId: bigint): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Primero desactivar todas las sucursales principales del proveedor
      await supabase
        .from('provider_branches')
        .update({ is_main_branch: false })
        .eq('provider_id', providerId)
        .eq('is_main_branch', true);

      // Luego activar la nueva sucursal principal
      const { error } = await supabase
        .from('provider_branches')
        .update({ 
          is_main_branch: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', branchId)
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado local
      setBranches(prev => prev.map(branch => ({
        ...branch,
        is_main_branch: branch.id === branchId
      })));

      return true;
    } catch (err) {
      setError('Error al establecer sucursal principal');
      console.error('Error en setMainBranch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar sucursales
  const searchBranches = useCallback(async (providerId: bigint, searchTerm: string): Promise<ProviderBranch[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider_branches')
        .select('*')
        .eq('provider_id', providerId)
        .or(`branch_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`)
        .order('is_main_branch', { ascending: false })
        .order('branch_name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError('Error al buscar sucursales');
      console.error('Error en searchBranches:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de sucursales
  const getBranchStats = useCallback(async (providerId: bigint) => {
    try {
      const { data, error } = await supabase
        .from('provider_branches')
        .select('id, is_active, is_main_branch, city')
        .eq('provider_id', providerId);

      if (error) throw error;

      const totalBranches = data?.length || 0;
      const activeBranches = data?.filter(b => b.is_active).length || 0;
      const mainBranch = data?.find(b => b.is_main_branch);
      const uniqueCities = new Set(data?.map(b => b.city).filter(Boolean)).size;

      return {
        totalBranches,
        activeBranches,
        inactiveBranches: totalBranches - activeBranches,
        hasMainBranch: !!mainBranch,
        uniqueCities
      };
    } catch (err) {
      console.error('Error en getBranchStats:', err);
      return {
        totalBranches: 0,
        activeBranches: 0,
        inactiveBranches: 0,
        hasMainBranch: false,
        uniqueCities: 0
      };
    }
  }, []);

  // Cargar sucursales al inicializar si se proporciona providerId
  useEffect(() => {
    if (providerId) {
      getBranchesByProvider(providerId);
    }
  }, [providerId, getBranchesByProvider]);

  return {
    branches,
    loading,
    error,
    getBranchesByProvider,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
    setMainBranch,
    searchBranches,
    getBranchStats
  };
};

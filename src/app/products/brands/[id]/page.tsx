'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit,
  Trash2,
  FileText,
  Package
} from 'lucide-react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { 
  Provider, 
  useProviders, 
  useProviderBranches,
  ProviderBranch,
  CreateProviderBranchData,
  UpdateProviderBranchData,
  UpdateProviderData,
  CreateProviderData
} from '@/core/providers';
import { ProviderModal } from '../_components/ProviderModal';
import { DeleteProviderModal } from '../_components/DeleteProviderModal';
import { BranchesList } from '../_components/BranchesList';
import { BranchModal } from '../_components/BranchModal';
import { DeleteBranchModal } from '../_components/DeleteBranchModal';

export default function ProviderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getProviderById, updateProvider, deleteProvider } = useProviders();
  const {
    branches,
    loading: branchesLoading,
    getBranchesByProvider,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
    setMainBranch,
    getBranchStats
  } = useProviderBranches();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Branch management states
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isDeleteBranchModalOpen, setIsDeleteBranchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<ProviderBranch | null>(null);
  const [branchStats, setBranchStats] = useState({
    totalBranches: 0,
    activeBranches: 0,
    inactiveBranches: 0,
    hasMainBranch: false,
    uniqueCities: 0
  });

  const providerId = params.id as string;

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) return;
      
      setLoading(true);
      try {
        const providerData = await getProviderById(BigInt(providerId));
        setProvider(providerData);
        
        // Load branches and stats
        const providerIdBigInt = BigInt(providerId);
        await getBranchesByProvider(providerIdBigInt);
        const stats = await getBranchStats(providerIdBigInt);
        setBranchStats(stats);
      } catch (err) {
        setError('Error al cargar la información del proveedor');
        console.error('Error fetching provider:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId, getProviderById, getBranchesByProvider, getBranchStats]);

  const handleEdit = async (data: UpdateProviderData | CreateProviderData) => {
    setActionLoading(true);
    try {
      const success = await updateProvider(data as UpdateProviderData);
      if (success) {
        setProvider(prev => prev ? { ...prev, ...data } : null);
      }
      return success;
    } catch (error) {
      console.error('Error al actualizar:', error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (providerId: bigint) => {
    setActionLoading(true);
    try {
      const success = await deleteProvider(providerId);
      if (success) {
        router.push('/products/brands');
      }
      return success;
    } catch (error) {
      console.error('Error al eliminar:', error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Branch management handlers
  const handleAddBranch = () => {
    setSelectedBranch(null);
    setIsBranchModalOpen(true);
  };

  const handleEditBranch = (branch: ProviderBranch) => {
    setSelectedBranch(branch);
    setIsBranchModalOpen(true);
  };

  const handleDeleteBranch = (branch: ProviderBranch) => {
    setSelectedBranch(branch);
    setIsDeleteBranchModalOpen(true);
  };

  const handleSaveBranch = async (data: CreateProviderBranchData | UpdateProviderBranchData) => {
    try {
      let success = false;
      if ('id' in data) {
        success = await updateBranch(data);
      } else {
        success = await createBranch(data);
      }
      
      if (success && provider?.id) {
        // Refresh stats
        const stats = await getBranchStats(provider.id);
        setBranchStats(stats);
      }
      
      return success;
    } catch (error) {
      console.error('Error saving branch:', error);
      return false;
    }
  };

  const handleConfirmDeleteBranch = async (branchId: number) => {
    try {
      const success = await deleteBranch(branchId);
      if (success && provider?.id) {
        // Refresh stats
        const stats = await getBranchStats(provider.id);
        setBranchStats(stats);
      }
      return success;
    } catch (error) {
      console.error('Error deleting branch:', error);
      return false;
    }
  };

  const handleToggleBranchStatus = async (branchId: number, isActive: boolean) => {
    try {
      const success = await toggleBranchStatus(branchId, isActive);
      if (success && provider?.id) {
        // Refresh stats
        const stats = await getBranchStats(provider.id);
        setBranchStats(stats);
      }
      return success;
    } catch (error) {
      console.error('Error toggling branch status:', error);
      return false;
    }
  };

  const handleSetMainBranch = async (branchId: number) => {
    if (!provider?.id) return false;
    try {
      const success = await setMainBranch(branchId, provider.id);
      if (success) {
        // Refresh stats
        const stats = await getBranchStats(provider.id);
        setBranchStats(stats);
      }
      return success;
    } catch (error) {
      console.error('Error setting main branch:', error);
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !provider) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Proveedor no encontrado'}
            </h2>
            <button
              onClick={() => router.push('/products/brands')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Proveedores
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/products/brands')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Detalles del Proveedor
                  </h1>
                  <p className="text-sm text-gray-500">
                    Información completa de {provider.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </button>
                
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-gray-900">{provider.name}</h2>
                      <p className="text-sm text-gray-500">ID: {provider.id?.toString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de Contacto */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-gray-400" />
                        Información de Contacto
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{provider.email || 'No especificado'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Teléfono</p>
                            <p className="text-sm text-gray-900">{provider.phone || 'No especificado'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Representante</p>
                            <p className="text-sm text-gray-900">{provider.representative || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de Ubicación */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                        Ubicación
                      </h3>
                      <div className="space-y-3">
                        {provider.direction && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Dirección</p>
                            <p className="text-sm text-gray-900">{provider.direction}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Ciudad</p>
                            <p className="text-sm text-gray-900">{provider.city || 'No especificada'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Estado</p>
                            <p className="text-sm text-gray-900">{provider.state || 'No especificado'}</p>
                          </div>
                        </div>
                        
                        {provider.postal_code && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Código Postal</p>
                            <p className="text-sm text-gray-900">{provider.postal_code}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              {(provider.inventory_reading || provider.warranty) && (
                <div className="mt-8 bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-400" />
                      Información Adicional
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {provider.inventory_reading && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Lectura de Inventario</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {provider.inventory_reading}
                          </p>
                        </div>
                      )}
                      
                      {provider.warranty && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Información de Garantía</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {provider.warranty}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Branch Stats */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-gray-400" />
                  Estadísticas de Sucursales
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{branchStats.totalBranches}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{branchStats.activeBranches}</p>
                      <p className="text-sm text-gray-600">Activas</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{branchStats.uniqueCities}</p>
                      <p className="text-sm text-gray-600">Ciudades</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{branchStats.hasMainBranch ? '1' : '0'}</p>
                      <p className="text-sm text-gray-600">Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                      <p className="text-sm text-gray-900">
                        {provider.created_at ? formatDate(provider.created_at) : 'No disponible'}
                      </p>
                    </div>
                  </div>
                  
                  {provider.updated_at && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Última Actualización</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(provider.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información
                  </button>
                  
                  <button
                    onClick={handleAddBranch}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Agregar Sucursal
                  </button>
                  
                  <button
                    onClick={() => console.log('Ver productos del proveedor')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Ver Productos
                  </button>
                  
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Proveedor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Branches Section */}
          <div className="mt-8">
            <BranchesList
              branches={branches}
              loading={branchesLoading}
              onAddBranch={handleAddBranch}
              onEditBranch={handleEditBranch}
              onDeleteBranch={handleDeleteBranch}
              onToggleStatus={handleToggleBranchStatus}
              onSetMainBranch={handleSetMainBranch}
            />
          </div>
        </div>

        {/* Modals */}
        <ProviderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          provider={provider}
          onSave={handleEdit}
          isLoading={actionLoading}
        />
        
        <DeleteProviderModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          provider={provider}
          onConfirm={handleDelete}
          isLoading={actionLoading}
        />
        
        {/* Branch Modals */}
        {provider && (
          <>
            <BranchModal
              isOpen={isBranchModalOpen}
              onClose={() => setIsBranchModalOpen(false)}
              branch={selectedBranch}
              providerId={provider.id!}
              onSave={handleSaveBranch}
              isLoading={branchesLoading}
            />
            
            <DeleteBranchModal
              isOpen={isDeleteBranchModalOpen}
              onClose={() => setIsDeleteBranchModalOpen(false)}
              branch={selectedBranch}
              onConfirm={handleConfirmDeleteBranch}
              isLoading={branchesLoading}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

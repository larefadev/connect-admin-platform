'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import supabase from '@/lib/Supabase';
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

  // States for brands and products
  const [providerBrands, setProviderBrands] = useState<Array<{brand: string, brand_id: string}>>([]);
  const [providerProducts, setProviderProducts] = useState<Array<{SKU: string, name: string, price: number, brand: string}>>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;

  const providerId = params.id as string;

  // Load provider brands from brand_provider table
  const loadProviderBrands = async (providerId: string) => {
    setBrandsLoading(true);
    try {
      const { data: brandsData, error } = await supabase
        .from('brand_provider')
        .select('brand, brand_id')
        .eq('provider_id', providerId);

      if (error) {
        console.error('Error loading provider brands:', error);
        return;
      }

      setProviderBrands(brandsData || []);
    } catch (error) {
      console.error('Error loading provider brands:', error);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Load provider products from products_test table with pagination
  const loadProviderProducts = useCallback(async (providerId: string, page: number = 1) => {
    console.log('Loading products for provider:', providerId, 'page:', page);
    setProductsLoading(true);
    try {
      // Get paginated products without count to avoid timeout
      const from = (page - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      const { data: productsData, error } = await supabase
        .from('products_test')
        .select('SKU, name, price, brand')
        .eq('provider_id', Number(providerId))
        .order('name')
        .range(from, to);

      if (error) {
        console.error('Error loading provider products:', error);
        setProviderProducts([]);
        setTotalProducts(0);
        return;
      }

      console.log('Products loaded:', productsData?.length || 0);
      
      setProviderProducts(productsData || []);
      
      // Estimate total based on current page results
      if (productsData && productsData.length > 0) {
        if (productsData.length < productsPerPage) {
          // Last page - calculate exact total
          setTotalProducts(from + productsData.length);
        } else {
          // Not last page - estimate based on having more pages
          // Set a reasonable estimate that allows pagination
          setTotalProducts(Math.max(totalProducts, (page * productsPerPage) + 1));
        }
      } else if (page === 1) {
        // No products on first page means no products at all
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Error loading provider products:', error);
      setProviderProducts([]);
      setTotalProducts(0);
    } finally {
      console.log('Products loading finished');
      setProductsLoading(false);
    }
  }, [productsPerPage]);

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

        // Load brands and products
        await loadProviderBrands(providerId);
        await loadProviderProducts(providerId, 1);
      } catch (err) {
        setError('Error al cargar la información del proveedor');
        console.error('Error fetching provider:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId, getProviderById, getBranchesByProvider, getBranchStats, loadProviderProducts]);

  // Pagination handlers
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      await loadProviderProducts(providerId, page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

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
        router.push('/dashboard/products/brands');
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
              onClick={() => router.back()}
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

          {/* Brands Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-gray-400" />
                  Marcas que Provee
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {providerBrands.length}
                  </span>
                </h3>
              </div>
              
              <div className="p-6">
                {brandsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Cargando marcas...</span>
                  </div>
                ) : providerBrands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providerBrands.map((brand, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">{brand.brand}</h4>
                            <p className="text-xs text-gray-500">ID: {brand.brand_id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay marcas registradas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Este proveedor no tiene marcas asignadas en el sistema.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-400" />
                  Productos que Provee
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {totalProducts} total
                  </span>
                </h3>
              </div>
              
              <div className="p-6">
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-500">Cargando productos...</span>
                  </div>
                ) : totalProducts > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre del Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Marca
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Precio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {providerProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {product.SKU}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate" title={product.name}>
                                  {product.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.brand || 'Sin marca'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ${product.price?.toFixed(2) || '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="flex items-center text-sm text-gray-500">
                          Mostrando {((currentPage - 1) * productsPerPage) + 1} - {((currentPage - 1) * productsPerPage) + providerProducts.length} de {totalProducts > 0 ? `${totalProducts}+` : '0'} productos
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1 || productsLoading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  disabled={productsLoading}
                                  className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
                                    currentPage === pageNum
                                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || productsLoading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos registrados</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Este proveedor no tiene productos asignados en el sistema.
                    </p>
                  </div>
                )}
              </div>
            </div>
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

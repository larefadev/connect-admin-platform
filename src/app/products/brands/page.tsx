'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Mail,
  Phone,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useProviders, Provider, CreateProviderData, UpdateProviderData } from '@/core/providers';
import { ProviderModal } from './_components/ProviderModal';
import { DeleteProviderModal } from './_components/DeleteProviderModal';


function ActionMenu({ 
  provider, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: { 
  provider: Provider;
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  onViewDetails: (provider: Provider) => void;
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg">
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onViewDetails(provider)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onEdit(provider)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Proveedor
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onDelete(provider)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-red-600' : 'text-red-600'
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function ProviderManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('Todos');
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [stats, setStats] = useState({
    totalProviders: 0,
    uniqueCities: 0,
    uniqueStates: 0,
    providersWithEmail: 0
  });

  const {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderStats
  } = useProviders();

  useEffect(() => {
    const loadStats = async () => {
      const providerStats = await getProviderStats();
      setStats(providerStats);
    };
    loadStats();
  }, [providers, getProviderStats]);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = (provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          provider.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          provider.representative?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false;
    const matchesState = stateFilter === 'Todos' || provider.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const handleCreateProvider = () => {
    setSelectedProvider(null);
    setIsProviderModalOpen(true);
  };

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsProviderModalOpen(true);
  };

  const handleDeleteProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetails = (provider: Provider) => {
    if (provider.id) {
      router.push(`/products/brands/${provider.id}`);
    }
  };

  const handleSaveProvider = async (data: CreateProviderData | UpdateProviderData) => {
    if ('id' in data) {
      return await updateProvider(data);
    } else {
      return await createProvider(data);
    }
  };

  const handleConfirmDelete = async (providerId: bigint) => {
    return await deleteProvider(providerId);
  };

  const uniqueStates = Array.from(new Set(providers.map(p => p.state).filter(Boolean)));

  if (loading && providers.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h1>
            <p className="text-gray-600 mt-1">Gestiona los proveedores y su información de contacto</p>
          </div>
          <button 
            onClick={handleCreateProvider}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Proveedor
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Proveedores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estados Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.uniqueStates}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ciudades Únicas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.uniqueCities}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Mail className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Email</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.providersWithEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proveedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Estados</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state || ''}>{state}</option>
                ))}
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Más Filtros
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.city}, {provider.state}</p>
                    </div>
                  </div>
                  <ActionMenu 
                    provider={provider}
                    onEdit={handleEditProvider}
                    onDelete={handleDeleteProvider}
                    onViewDetails={handleViewDetails}
                  />
                </div>

                {provider.direction && (
                  <div className="mt-4 flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{provider.direction}</p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {provider.representative && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Representante:</span>
                      <span className="font-medium text-gray-900">{provider.representative}</span>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 text-gray-400 mr-2" />
                      <span className="text-gray-600">{provider.email}</span>
                    </div>
                  )}
                  {provider.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 text-gray-400 mr-2" />
                      <span className="text-gray-600">{provider.phone}</span>
                    </div>
                  )}
                  {provider.postal_code && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">C.P.:</span>
                      <span className="font-medium text-gray-900">{provider.postal_code}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEditProvider(provider)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleViewDetails(provider)}
                    className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredProviders.length}</span> de{' '}
                <span className="font-medium">{filteredProviders.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Anterior
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        provider={selectedProvider}
        onSave={handleSaveProvider}
        isLoading={loading}
      />

      <DeleteProviderModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        provider={selectedProvider}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </DashboardLayout>
  );
}

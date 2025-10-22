'use client';

import { useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  Mail,
  Calendar
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useSeller } from '@/core/sellers';
import { Person } from '@/core/sellers/Entities/Person';


function getStatusColor(status: boolean) {
  return status 
    ? 'bg-green-100 text-green-800' 
    : 'bg-yellow-100 text-yellow-800';
}

function getStatusText(status: boolean) {
  return status ? 'Aprobado' : 'Pendiente';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function ActionMenu({ application, onApprove, onReject }: { 
  application: Person;
  onApprove: (person: Person) => void;
  onReject: (person: Person) => void;
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
              onClick={() => onApprove(application)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-green-600' : 'text-green-600'
              }`}
            >
              <Check className="h-4 w-4 mr-2" />
              Aprobar
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onReject(application)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-red-600' : 'text-red-600'
              }`}
            >
              <X className="h-4 w-4 mr-2" />
              Rechazar
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function PendingApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { sellers, loading, error, updateSellerStatus, deleteSeller } = useSeller();

  // Filtrar solo usuarios pendientes (status === false)
  const pendingApplications = sellers.filter(seller => !seller.status);

  const filteredApplications = pendingApplications.filter(application => {
    const matchesSearch = (application.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          application.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          application.email?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false;
    return matchesSearch;
  });

  const handleApprove = async (person: Person) => {
    if (person.id) {
      const success = await updateSellerStatus(person.id, true);
      if (success) {
        console.log('Usuario aprobado exitosamente');
      }
    }
  };

  const handleReject = async (person: Person) => {
    if (person.id) {
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas rechazar la solicitud de ${person.name || person.username}? Esta acción eliminará al usuario.`
      );
      if (confirmed) {
        const success = await deleteSeller(person.id);
        if (success) {
          console.log('Solicitud rechazada exitosamente');
        }
      }
    }
  };

  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Solicitudes Pendientes</h1>
            <p className="text-gray-600 mt-1">Revisar y gestionar las solicitudes de revendedores</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Aprobar en Lote
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
              <X className="h-4 w-4 mr-2" />
              Rechazar en Lote
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pendiente</p>
                <p className="text-2xl font-bold text-gray-900">{pendingApplications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApplications.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nuevas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApplications.filter(app => {
                    const today = new Date().toDateString();
                    const appDate = new Date(app.created_at || '').toDateString();
                    return today === appDate;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApplications.filter(app => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const appDate = new Date(app.created_at || '');
                    return appDate >= weekAgo;
                  }).length}
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
                  placeholder="Buscar solicitudes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
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

        {/* Applications Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Solicitud
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {application.profile_image ? (
                          <img 
                            className="h-12 w-12 rounded-full object-cover" 
                            src={application.profile_image} 
                            alt={`${application.name || application.username} profile`}
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-700">
                              {application.name ? application.name.charAt(0).toUpperCase() : application.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.name && application.last_name 
                              ? `${application.name} ${application.last_name}`.trim()
                              : application.name || application.username
                            }
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {application.email || 'No especificado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">@{application.username}</div>
                      <div className="text-sm text-gray-500">ID: {application.id?.toString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.person_type ? `Tipo ${application.person_type}` : 'Revendedor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {application.created_at ? formatDate(application.created_at) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu 
                        application={application} 
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredApplications.length}</span> de{' '}
                <span className="font-medium">{filteredApplications.length}</span> resultados
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
    </DashboardLayout>
  );
}

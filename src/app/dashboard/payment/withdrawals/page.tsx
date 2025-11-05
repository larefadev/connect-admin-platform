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
  DollarSign,
  CreditCard,
  Calendar,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Menu } from '@headlessui/react';

const withdrawalRequests = [
  {
    id: 'WDR-12345',
    reseller: {
      name: 'Juan Pérez',
      storeName: 'TechStore CDMX',
      email: 'juan@techstorecdmx.com',
      phone: '+52 (555) 123-4567'
    },
    amount: 2450.00,
    currency: 'USD',
    status: 'Pendiente',
    requestDate: '2024-01-20',
    method: 'Transferencia Bancaria',
    bankDetails: {
      accountName: 'Juan Pérez',
      accountNumber: '****1234',
      bankName: 'BBVA',
      routingNumber: '****5678'
    },
    availableBalance: 3200.00,
    minimumBalance: 100.00,
    processingFee: 25.00,
    netAmount: 2425.00,
    reason: 'Retiro mensual',
    documents: ['Estado de Cuenta', 'Identificación'],
  },
  {
    id: 'WDR-12346',
    reseller: {
      name: 'Sara Gómez',
      storeName: 'Electronics Hub',
      email: 'sara@electronicshub.com',
      phone: '+52 (555) 987-6543'
    },
    amount: 1800.00,
    currency: 'USD',
    status: 'Aprobado',
    requestDate: '2024-01-19',
    approvedDate: '2024-01-20',
    method: 'PayPal',
    bankDetails: {
      accountName: 'Sara Gómez',
      paypalEmail: 'sara@electronicshub.com'
    },
    availableBalance: 2100.00,
    minimumBalance: 100.00,
    processingFee: 18.00,
    netAmount: 1782.00,
    reason: 'Compra de equipo',
    documents: ['Verificación PayPal'],
  },
  {
    id: 'WDR-12347',
    reseller: {
      name: 'Miguel Ramírez',
      storeName: 'Gadget World',
      email: 'miguel@gadgetworld.com',
      phone: '+52 (555) 456-7890'
    },
    amount: 950.00,
    currency: 'USD',
    status: 'Completado',
    requestDate: '2024-01-18',
    approvedDate: '2024-01-19',
    completedDate: '2024-01-20',
    method: 'Transferencia Bancaria',
    bankDetails: {
      accountName: 'Miguel Ramírez',
      accountNumber: '****9876',
      bankName: 'Santander',
      routingNumber: '****4321'
    },
    availableBalance: 1200.00,
    minimumBalance: 100.00,
    processingFee: 9.50,
    netAmount: 940.50,
    reason: 'Reabastecimiento de inventario',
    documents: ['Estado de Cuenta', 'Licencia de Negocio'],
  },
  {
    id: 'WDR-12348',
    reseller: {
      name: 'Elena Torres',
      storeName: 'Mobile Plus',
      email: 'elena@mobileplus.com',
      phone: '+52 (555) 321-0987'
    },
    amount: 3200.00,
    currency: 'USD',
    status: 'Rechazado',
    requestDate: '2024-01-17',
    rejectedDate: '2024-01-18',
    method: 'Transferencia Bancaria',
    bankDetails: {
      accountName: 'Elena Torres',
      accountNumber: '****5555',
      bankName: 'Banamex',
      routingNumber: '****7777'
    },
    availableBalance: 2800.00,
    minimumBalance: 100.00,
    processingFee: 32.00,
    netAmount: 3168.00,
    reason: 'Expansión del negocio',
    rejectionReason: 'Documentación insuficiente',
    documents: ['Estado de Cuenta'],
  },
  {
    id: 'WDR-12349',
    reseller: {
      name: 'David López',
      storeName: 'Tech Solutions',
      email: 'david@techsolutions.com',
      phone: '+52 (555) 654-3210'
    },
    amount: 1500.00,
    currency: 'USD',
    status: 'En Revisión',
    requestDate: '2024-01-21',
    method: 'Billetera Cripto',
    bankDetails: {
      accountName: 'David López',
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    availableBalance: 1800.00,
    minimumBalance: 100.00,
    processingFee: 15.00,
    netAmount: 1485.00,
    reason: 'Actualización de tecnología',
    documents: ['Verificación de Billetera', 'Identificación'],
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'En Revisión':
      return 'bg-blue-100 text-blue-800';
    case 'Aprobado':
      return 'bg-green-100 text-green-800';
    case 'Completado':
      return 'bg-green-100 text-green-800';
    case 'Rechazado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Pendiente':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'En Revisión':
      return <Eye className="h-4 w-4 text-blue-600" />;
    case 'Aprobado':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'Completado':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'Rechazado':
      return <X className="h-4 w-4 text-red-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
}

function ActionMenu({ request }: { request: { id: string; status: string; amount: number } }) {
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
        {request.status === 'Pendiente' && (
          <>
            <Menu.Item>
              {({ active }) => (
                <button
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
                  className={`w-full flex items-center px-4 py-2 text-sm ${
                    active ? 'bg-gray-50 text-red-600' : 'text-red-600'
                  }`}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar
                </button>
              )}
            </Menu.Item>
          </>
        )}
        <Menu.Item>
          {({ active }) => (
            <button
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Recibo
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function WithdrawalRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [methodFilter, setMethodFilter] = useState('Todos');

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reseller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reseller.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reseller.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || request.status === statusFilter;
    const matchesMethod = methodFilter === 'Todos' || request.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPendingAmount = withdrawalRequests
    .filter(r => r.status === 'Pendiente')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalCompletedAmount = withdrawalRequests
    .filter(r => r.status === 'Completado')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Retiro</h1>
            <p className="text-gray-600 mt-1">Revisar y procesar solicitudes de retiro de revendedores</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Aprobar en Lote
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{withdrawalRequests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Pendiente</p>
                <p className="text-2xl font-bold text-gray-900">${totalPendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Completado</p>
                <p className="text-2xl font-bold text-gray-900">${totalCompletedAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rechazado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {withdrawalRequests.filter(r => r.status === 'Rechazado').length}
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
                  placeholder="Buscar solicitudes de retiro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Completado">Completado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Métodos</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="PayPal">PayPal</option>
                <option value="Billetera Cripto">Billetera Cripto</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Más Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID de Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{request.id}</div>
                      <div className="text-xs text-gray-500">{request.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.reseller.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {request.reseller.storeName}
                          </div>
                          <div className="text-xs text-gray-400">{request.reseller.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${request.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Neto: ${request.netAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Comisión: ${request.processingFee.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.method}</div>
                      <div className="text-xs text-gray-500">
                        {request.bankDetails.accountNumber && `****${request.bankDetails.accountNumber.slice(-4)}`}
                        {request.bankDetails.paypalEmail && request.bankDetails.paypalEmail}
                        {request.bankDetails.walletAddress && `${request.bankDetails.walletAddress.slice(0, 8)}...`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      {request.rejectionReason && (
                        <div className="text-xs text-red-500 mt-1">{request.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {request.requestDate}
                      </div>
                      {request.completedDate && (
                        <div className="text-xs text-gray-500">
                          Completado: {request.completedDate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {request.documents.length} {request.documents.length > 1 ? 'documentos' : 'documento'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.documents.slice(0, 2).join(', ')}
                        {request.documents.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu request={request} />
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredRequests.length}</span> de{' '}
                <span className="font-medium">{filteredRequests.length}</span> resultados
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

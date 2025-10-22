'use client';

import { useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Menu } from '@headlessui/react';

const transactions = [
  {
    id: 'TXN-12345',
    type: 'Pago',
    amount: 219.97,
    currency: 'USD',
    status: 'Completado',
    method: 'Tarjeta de Crédito',
    cardLast4: '4532',
    orderId: '#ORD-12345',
    customer: 'Juan Pérez',
    reseller: 'TechStore CDMX',
    date: '2024-01-20',
    time: '14:30:25',
    fee: 6.60,
    netAmount: 213.37,
    description: 'Pago de pedido por audífonos inalámbricos',
  },
  {
    id: 'TXN-12346',
    type: 'Reembolso',
    amount: -105.97,
    currency: 'USD',
    status: 'Completado',
    method: 'Tarjeta de Crédito',
    cardLast4: '1234',
    orderId: '#ORD-12349',
    customer: 'David López',
    reseller: 'Tech Solutions',
    date: '2024-01-19',
    time: '16:45:12',
    fee: -3.18,
    netAmount: -102.79,
    description: 'Reembolso por pedido cancelado',
  },
  {
    id: 'TXN-12347',
    type: 'Pago',
    amount: 239.97,
    currency: 'USD',
    status: 'Completado',
    method: 'PayPal',
    cardLast4: null,
    orderId: '#ORD-12346',
    customer: 'Sara Gómez',
    reseller: 'Electronics Hub',
    date: '2024-01-19',
    time: '10:15:33',
    fee: 7.20,
    netAmount: 232.77,
    description: 'Pago de pedido por reloj inteligente',
  },
  {
    id: 'TXN-12348',
    type: 'Pago',
    amount: 69.98,
    currency: 'USD',
    status: 'En Proceso',
    method: 'Transferencia Bancaria',
    cardLast4: null,
    orderId: '#ORD-12347',
    customer: 'Miguel Ramírez',
    reseller: 'Gadget World',
    date: '2024-01-18',
    time: '09:22:41',
    fee: 2.10,
    netAmount: 67.88,
    description: 'Pago de pedido por accesorios de laptop',
  },
  {
    id: 'TXN-12349',
    type: 'Pago',
    amount: 74.97,
    currency: 'USD',
    status: 'Fallido',
    method: 'Tarjeta de Crédito',
    cardLast4: '9876',
    orderId: '#ORD-12348',
    customer: 'Elena Torres',
    reseller: 'Mobile Plus',
    date: '2024-01-21',
    time: '11:30:15',
    fee: 0,
    netAmount: 0,
    description: 'Pago fallido - fondos insuficientes',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Completado':
      return 'bg-green-100 text-green-800';
    case 'En Proceso':
      return 'bg-yellow-100 text-yellow-800';
    case 'Fallido':
      return 'bg-red-100 text-red-800';
    case 'Pendiente':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Completado':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'En Proceso':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'Fallido':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'Pago':
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    case 'Reembolso':
      return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    default:
      return <DollarSign className="h-4 w-4 text-gray-600" />;
  }
}

function ActionMenu({ transaction }: { transaction: any }) {
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
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Recibo
            </button>
          )}
        </Menu.Item>
        {transaction.status === 'Fallido' && (
          <Menu.Item>
            {({ active }) => (
              <button
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar Pago
              </button>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  );
}

export default function TransactionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [methodFilter, setMethodFilter] = useState('Todos');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reseller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'Todos' || transaction.type === typeFilter;
    const matchesMethod = methodFilter === 'Todos' || transaction.method === methodFilter;
    return matchesSearch && matchesStatus && matchesType && matchesMethod;
  });

  const totalVolume = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalFees = transactions.reduce((sum, t) => sum + Math.abs(t.fee), 0);
  const completedTransactions = transactions.filter(t => t.status === 'Completado').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Transacciones</h1>
            <p className="text-gray-600 mt-1">Monitorea todas las transacciones de pago</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
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
                <p className="text-sm font-medium text-gray-600">Total de Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Volumen Total</p>
                <p className="text-2xl font-bold text-gray-900">${totalVolume.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((completedTransactions / transactions.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
                <p className="text-2xl font-bold text-gray-900">${totalFees.toFixed(2)}</p>
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
                  placeholder="Buscar transacciones..."
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
                <option value="Completado">Completado</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Fallido">Fallido</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Tipos</option>
                <option value="Pago">Pago</option>
                <option value="Reembolso">Reembolso</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Métodos</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="PayPal">PayPal</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Más Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transacción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
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
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comisiones
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-600">{transaction.id}</div>
                          <div className="text-sm text-gray-500">{transaction.type}</div>
                          <div className="text-xs text-gray-400">{transaction.orderId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.customer}</div>
                      <div className="text-sm text-gray-500">{transaction.reseller}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Neto: ${Math.abs(transaction.netAmount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.method}</div>
                      {transaction.cardLast4 && (
                        <div className="text-xs text-gray-500">****{transaction.cardLast4}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {transaction.date}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Math.abs(transaction.fee).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu transaction={transaction} />
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredTransactions.length}</span> de{' '}
                <span className="font-medium">{filteredTransactions.length}</span> resultados
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

'use client';

import { useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { Menu } from '@headlessui/react';

const orders = [
  {
    id: '#ORD-12345',
    customer: {
      name: 'Juan Pérez',
      email: 'juan.perez@ejemplo.com',
      phone: '+52 (555) 123-4567',
      avatar: '/placeholder-avatar.jpg'
    },
    reseller: 'TechStore CDMX',
    items: [
      { name: 'Audífonos Inalámbricos', quantity: 2, price: 99.99 },
      { name: 'Funda para Teléfono', quantity: 1, price: 19.99 }
    ],
    totalAmount: 219.97,
    status: 'En Proceso',
    paymentStatus: 'Pagado',
    shippingAddress: 'Av. Principal 123, Ciudad de México, CDMX 10001',
    orderDate: '2024-01-20',
    estimatedDelivery: '2024-01-25',
    trackingNumber: 'TRK123456789',
  },
  {
    id: '#ORD-12346',
    customer: {
      name: 'Sara Gómez',
      email: 'sara.g@ejemplo.com',
      phone: '+52 (555) 987-6543',
      avatar: '/placeholder-avatar.jpg'
    },
    reseller: 'Electronics Hub',
    items: [
      { name: 'Reloj Inteligente', quantity: 1, price: 199.99 },
      { name: 'Cable de Carga', quantity: 2, price: 19.99 }
    ],
    totalAmount: 239.97,
    status: 'Enviado',
    paymentStatus: 'Pagado',
    shippingAddress: 'Calle Roble 456, Guadalajara, JAL 90210',
    orderDate: '2024-01-19',
    estimatedDelivery: '2024-01-24',
    trackingNumber: 'TRK987654321',
  },
  {
    id: '#ORD-12347',
    customer: {
      name: 'Miguel Ramírez',
      email: 'miguel.ramirez@ejemplo.com',
      phone: '+52 (555) 456-7890',
      avatar: '/placeholder-avatar.jpg'
    },
    reseller: 'Gadget World',
    items: [
      { name: 'Soporte para Laptop', quantity: 1, price: 29.99 },
      { name: 'Mouse Inalámbrico', quantity: 1, price: 39.99 }
    ],
    totalAmount: 69.98,
    status: 'Entregado',
    paymentStatus: 'Pagado',
    shippingAddress: 'Calle Pino 789, Monterrey, NL 60601',
    orderDate: '2024-01-18',
    estimatedDelivery: '2024-01-23',
    trackingNumber: 'TRK456789123',
  },
  {
    id: '#ORD-12348',
    customer: {
      name: 'Elena Torres',
      email: 'elena.torres@ejemplo.com',
      phone: '+52 (555) 321-0987',
      avatar: '/placeholder-avatar.jpg'
    },
    reseller: 'Mobile Plus',
    items: [
      { name: 'Cargador para Teléfono', quantity: 3, price: 24.99 }
    ],
    totalAmount: 74.97,
    status: 'Pendiente',
    paymentStatus: 'Pendiente',
    shippingAddress: 'Calle Olmo 321, Puebla, PUE 77001',
    orderDate: '2024-01-21',
    estimatedDelivery: '2024-01-26',
    trackingNumber: null,
  },
  {
    id: '#ORD-12349',
    customer: {
      name: 'David López',
      email: 'david.l@ejemplo.com',
      phone: '+52 (555) 654-3210',
      avatar: '/placeholder-avatar.jpg'
    },
    reseller: 'Tech Solutions',
    items: [
      { name: 'Bocina Bluetooth', quantity: 1, price: 79.99 },
      { name: 'Cable USB', quantity: 2, price: 12.99 }
    ],
    totalAmount: 105.97,
    status: 'Cancelado',
    paymentStatus: 'Reembolsado',
    shippingAddress: 'Av. Maple 654, Cancún, QR 33101',
    orderDate: '2024-01-17',
    estimatedDelivery: null,
    trackingNumber: null,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'En Proceso':
      return 'bg-blue-100 text-blue-800';
    case 'Enviado':
      return 'bg-purple-100 text-purple-800';
    case 'Entregado':
      return 'bg-green-100 text-green-800';
    case 'Cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'Pagado':
      return 'bg-green-100 text-green-800';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Reembolsado':
      return 'bg-red-100 text-red-800';
    case 'Fallido':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function ActionMenu({ order }: { order: { id: string; status: string } }) {
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
              <Edit className="h-4 w-4 mr-2" />
              Actualizar Estado
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
              <Truck className="h-4 w-4 mr-2" />
              Rastrear Pedido
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
              Descargar Factura
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [paymentFilter, setPaymentFilter] = useState('Todos');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.reseller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'Todos' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalRevenue / orders.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-1">Gestiona y da seguimiento a todos los pedidos</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Pedidos
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Promedio del Pedido</p>
                <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'Pendiente').length}
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
                  placeholder="Buscar pedidos..."
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
                <option value="En Proceso">En Proceso</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Pagos</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Reembolsado">Reembolsado</option>
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

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID de Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{order.id}</div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500">Rastreo: {order.trackingNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.reseller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} {order.items.length > 1 ? 'artículos' : 'artículo'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items[0].name}
                        {order.items.length > 1 && ` +${order.items.length - 1} más`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {order.orderDate}
                      </div>
                      {order.estimatedDelivery && (
                        <div className="text-xs text-gray-500">
                          Est: {order.estimatedDelivery}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu order={order} />
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredOrders.length}</span> de{' '}
                <span className="font-medium">{filteredOrders.length}</span> resultados
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

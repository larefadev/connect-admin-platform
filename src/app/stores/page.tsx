'use client';

import { useState } from 'react';
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
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { Menu } from '@headlessui/react';

const stores = [
  {
    id: 1,
    name: 'TechStore CDMX',
    owner: 'Juan Pérez',
    email: 'juan@techstorecdmx.com',
    phone: '+52 (555) 123-4567',
    address: 'Av. Reforma 123, Ciudad de México, CDMX 10001',
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
    status: 'Activo',
    category: 'Electrónicos',
    joinDate: '2023-06-15',
    totalSales: '$125,430',
    monthlyRevenue: '$15,670',
    productsCount: 234,
    ordersCount: 1456,
    rating: 4.8,
    commission: '15%',
    lastActivity: '2024-01-20',
  },
  {
    id: 2,
    name: 'Electronics Hub',
    owner: 'Sara Gómez',
    email: 'sara@electronicshub.com',
    phone: '+52 (555) 987-6543',
    address: 'Av. Juárez 456, Guadalajara, JAL 90210',
    city: 'Guadalajara',
    state: 'JAL',
    country: 'México',
    status: 'Activo',
    category: 'Electrónicos',
    joinDate: '2023-08-20',
    totalSales: '$89,250',
    monthlyRevenue: '$12,340',
    productsCount: 189,
    ordersCount: 987,
    rating: 4.6,
    commission: '12%',
    lastActivity: '2024-01-19',
  },
  {
    id: 3,
    name: 'Gadget World',
    owner: 'Miguel Ramírez',
    email: 'miguel@gadgetworld.com',
    phone: '+52 (555) 456-7890',
    address: 'Av. Hidalgo 789, Monterrey, NL 60601',
    city: 'Monterrey',
    state: 'NL',
    country: 'México',
    status: 'Inactivo',
    category: 'Gadgets',
    joinDate: '2023-03-10',
    totalSales: '$67,890',
    monthlyRevenue: '$8,920',
    productsCount: 156,
    ordersCount: 654,
    rating: 4.2,
    commission: '10%',
    lastActivity: '2024-01-10',
  },
  {
    id: 4,
    name: 'Mobile Plus',
    owner: 'Elena Torres',
    email: 'elena@mobileplus.com',
    phone: '+52 (555) 321-0987',
    address: 'Calle Principal 321, Puebla, PUE 77001',
    city: 'Puebla',
    state: 'PUE',
    country: 'México',
    status: 'Pendiente',
    category: 'Móviles',
    joinDate: '2024-01-18',
    totalSales: '$23,450',
    monthlyRevenue: '$5,670',
    productsCount: 78,
    ordersCount: 234,
    rating: 4.0,
    commission: '15%',
    lastActivity: '2024-01-18',
  },
  {
    id: 5,
    name: 'Tech Solutions',
    owner: 'David López',
    email: 'david@techsolutions.com',
    phone: '+52 (555) 654-3210',
    address: 'Av. Marina 654, Cancún, QR 33101',
    city: 'Cancún',
    state: 'QR',
    country: 'México',
    status: 'Activo',
    category: 'Tecnología',
    joinDate: '2023-11-05',
    totalSales: '$156,780',
    monthlyRevenue: '$18,340',
    productsCount: 312,
    ordersCount: 1789,
    rating: 4.9,
    commission: '18%',
    lastActivity: '2024-01-21',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Activo':
      return 'bg-green-100 text-green-800';
    case 'Inactivo':
      return 'bg-gray-100 text-gray-800';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Suspendido':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function ActionMenu({ store }: { store: { id: number; name: string; status: string } }) {
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
              Editar Tienda
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
              <Package className="h-4 w-4 mr-2" />
              Ver Productos
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
              <Trash2 className="h-4 w-4 mr-2" />
              Suspender Tienda
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function StoreManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || store.status === statusFilter;
    const matchesCategory = categoryFilter === 'Todos' || store.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalRevenue = stores.reduce((sum, store) => sum + parseFloat(store.totalSales.replace('$', '').replace(',', '')), 0);
  const totalProducts = stores.reduce((sum, store) => sum + store.productsCount, 0);
  const totalOrders = stores.reduce((sum, store) => sum + store.ordersCount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Tiendas</h1>
            <p className="text-gray-600 mt-1">Gestiona las tiendas de revendedores y su rendimiento</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Tienda
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Tiendas</p>
                <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Productos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
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
                  placeholder="Buscar tiendas..."
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
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Suspendido">Suspendido</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todas las Categorías</option>
                <option value="Electrónicos">Electrónicos</option>
                <option value="Gadgets">Gadgets</option>
                <option value="Móviles">Móviles</option>
                <option value="Tecnología">Tecnología</option>
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

        {/* Stores Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tienda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actividad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{store.name}</div>
                          <div className="text-sm text-gray-500">{store.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.owner}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {store.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {store.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {store.city}, {store.state}
                      </div>
                      <div className="text-sm text-gray-500">{store.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-gray-400" />
                          {store.productsCount} productos
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {store.ordersCount} pedidos
                        </div>
                        <div className="text-xs text-gray-500">
                          Calificación: {store.rating}/5.0
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.totalSales}</div>
                      <div className="text-sm text-gray-500">{store.monthlyRevenue}/mes</div>
                      <div className="text-xs text-gray-500">
                        Comisión: {store.commission}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(store.status)}`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {store.lastActivity}
                      </div>
                      <div className="text-xs text-gray-500">
                        Registrado: {store.joinDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu store={store} />
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredStores.length}</span> de{' '}
                <span className="font-medium">{filteredStores.length}</span> resultados
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

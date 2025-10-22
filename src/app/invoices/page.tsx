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
  Send,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Menu } from '@headlessui/react';

const invoices = [
  {
    id: 'INV-2024-001',
    invoiceNumber: 'INV-001',
    customer: {
      name: 'Juan Pérez',
      company: 'TechStore CDMX',
      email: 'juan@techstorecdmx.com',
      address: 'Av. Reforma 123, Ciudad de México, CDMX 10001'
    },
    amount: 2450.00,
    tax: 245.00,
    totalAmount: 2695.00,
    currency: 'USD',
    status: 'Pagado',
    issueDate: '2024-01-15',
    dueDate: '2024-02-14',
    paidDate: '2024-01-20',
    paymentMethod: 'Transferencia Bancaria',
    items: [
      { description: 'Comisión Mensual', quantity: 1, rate: 2450.00, amount: 2450.00 }
    ],
    notes: 'Pago de comisión mensual para enero 2024',
  },
  {
    id: 'INV-2024-002',
    invoiceNumber: 'INV-002',
    customer: {
      name: 'Sara Gómez',
      company: 'Electronics Hub',
      email: 'sara@electronicshub.com',
      address: 'Av. Juárez 456, Guadalajara, JAL 90210'
    },
    amount: 1800.00,
    tax: 180.00,
    totalAmount: 1980.00,
    currency: 'USD',
    status: 'Pendiente',
    issueDate: '2024-01-18',
    dueDate: '2024-02-17',
    paidDate: null,
    paymentMethod: null,
    items: [
      { description: 'Pago de Comisión', quantity: 1, rate: 1500.00, amount: 1500.00 },
      { description: 'Pago de Bonificación', quantity: 1, rate: 300.00, amount: 300.00 }
    ],
    notes: 'Pago de comisión y bonificación por rendimiento excepcional',
  },
  {
    id: 'INV-2024-003',
    invoiceNumber: 'INV-003',
    customer: {
      name: 'Miguel Ramírez',
      company: 'Gadget World',
      email: 'miguel@gadgetworld.com',
      address: 'Av. Hidalgo 789, Monterrey, NL 60601'
    },
    amount: 950.00,
    tax: 95.00,
    totalAmount: 1045.00,
    currency: 'USD',
    status: 'Vencido',
    issueDate: '2024-01-10',
    dueDate: '2024-02-09',
    paidDate: null,
    paymentMethod: null,
    items: [
      { description: 'Comisión Mensual', quantity: 1, rate: 950.00, amount: 950.00 }
    ],
    notes: 'Pago de comisión mensual - VENCIDO',
  },
  {
    id: 'INV-2024-004',
    invoiceNumber: 'INV-004',
    customer: {
      name: 'Elena Torres',
      company: 'Mobile Plus',
      email: 'elena@mobileplus.com',
      address: 'Calle Principal 321, Puebla, PUE 77001'
    },
    amount: 1200.00,
    tax: 120.00,
    totalAmount: 1320.00,
    currency: 'USD',
    status: 'Borrador',
    issueDate: '2024-01-22',
    dueDate: '2024-02-21',
    paidDate: null,
    paymentMethod: null,
    items: [
      { description: 'Pago de Comisión', quantity: 1, rate: 1000.00, amount: 1000.00 },
      { description: 'Tarifa de Configuración', quantity: 1, rate: 200.00, amount: 200.00 }
    ],
    notes: 'Configuración inicial y pago de comisión',
  },
  {
    id: 'INV-2024-005',
    invoiceNumber: 'INV-005',
    customer: {
      name: 'David López',
      company: 'Tech Solutions',
      email: 'david@techsolutions.com',
      address: 'Av. Marina 654, Cancún, QR 33101'
    },
    amount: 3200.00,
    tax: 320.00,
    totalAmount: 3520.00,
    currency: 'USD',
    status: 'Enviado',
    issueDate: '2024-01-20',
    dueDate: '2024-02-19',
    paidDate: null,
    paymentMethod: null,
    items: [
      { description: 'Comisión Mensual', quantity: 1, rate: 2800.00, amount: 2800.00 },
      { description: 'Bonificación por Rendimiento', quantity: 1, rate: 400.00, amount: 400.00 }
    ],
    notes: 'Comisión mensual con bonificación por rendimiento',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Pagado':
      return 'bg-green-100 text-green-800';
    case 'Enviado':
      return 'bg-blue-100 text-blue-800';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Vencido':
      return 'bg-red-100 text-red-800';
    case 'Borrador':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Pagado':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'Enviado':
      return <Send className="h-4 w-4 text-blue-600" />;
    case 'Pendiente':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'Vencido':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'Borrador':
      return <Edit className="h-4 w-4 text-gray-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
}

function ActionMenu({ invoice }: { invoice: any }) {
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
              Ver Factura
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
              Editar Factura
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
              Descargar PDF
            </button>
          )}
        </Menu.Item>
        {invoice.status === 'Borrador' && (
          <Menu.Item>
            {({ active }) => (
              <button
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-blue-600' : 'text-blue-600'
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Factura
              </button>
            )}
          </Menu.Item>
        )}
        {(invoice.status === 'Enviado' || invoice.status === 'Vencido') && (
          <Menu.Item>
            {({ active }) => (
              <button
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-green-600' : 'text-green-600'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Pagado
              </button>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  );
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'Pagado').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'Vencido').reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
            <p className="text-gray-600 mt-1">Gestiona y da seguimiento a todas las facturas y pagos</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Crear Factura
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Todas
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Facturas</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Pagado</p>
                <p className="text-2xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Vencido</p>
                <p className="text-2xl font-bold text-gray-900">${overdueAmount.toLocaleString()}</p>
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
                  placeholder="Buscar facturas..."
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
                <option value="Borrador">Borrador</option>
                <option value="Enviado">Enviado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Vencido">Vencido</option>
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

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Emisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-600">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-gray-500">{invoice.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{invoice.customer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {invoice.customer.company}
                          </div>
                          <div className="text-xs text-gray-400">{invoice.customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${invoice.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subtotal: ${invoice.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Impuesto: ${invoice.tax.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {invoice.issueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {invoice.dueDate}
                      </div>
                      {invoice.status === 'Vencido' && (
                        <div className="text-xs text-red-500">VENCIDO</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.paidDate ? (
                        <div>
                          <div className="text-sm text-green-600">Pagado</div>
                          <div className="text-xs text-gray-500">{invoice.paidDate}</div>
                          {invoice.paymentMethod && (
                            <div className="text-xs text-gray-400">{invoice.paymentMethod}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No Pagado</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu invoice={invoice} />
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredInvoices.length}</span> de{' '}
                <span className="font-medium">{filteredInvoices.length}</span> resultados
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

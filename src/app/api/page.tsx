'use client';

import { useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Key,
  Code,
  Activity,
  Calendar,
  User,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Menu } from '@headlessui/react';

const apiKeys = [
  {
    id: 'api_key_1',
    name: 'TechStore NYC Production',
    keyPreview: 'sk_live_4242424242424242',
    reseller: {
      name: 'John Smith',
      storeName: 'TechStore NYC',
      email: 'john@techstorenyc.com'
    },
    status: 'Active',
    environment: 'Production',
    permissions: ['read:products', 'write:orders', 'read:customers'],
    createdDate: '2024-01-15',
    lastUsed: '2024-01-21',
    requestCount: 15420,
    rateLimit: '1000/hour',
    ipWhitelist: ['192.168.1.100', '10.0.0.50'],
  },
  {
    id: 'api_key_2',
    name: 'Electronics Hub Test',
    keyPreview: 'sk_test_4242424242424242',
    reseller: {
      name: 'Sarah Johnson',
      storeName: 'Electronics Hub',
      email: 'sarah@electronicshub.com'
    },
    status: 'Active',
    environment: 'Test',
    permissions: ['read:products', 'read:orders'],
    createdDate: '2024-01-18',
    lastUsed: '2024-01-20',
    requestCount: 2340,
    rateLimit: '500/hour',
    ipWhitelist: ['203.0.113.0'],
  },
  {
    id: 'api_key_3',
    name: 'Gadget World Production',
    keyPreview: 'sk_live_5353535353535353',
    reseller: {
      name: 'Mike Davis',
      storeName: 'Gadget World',
      email: 'mike@gadgetworld.com'
    },
    status: 'Suspended',
    environment: 'Production',
    permissions: ['read:products', 'write:orders', 'read:customers', 'write:webhooks'],
    createdDate: '2024-01-10',
    lastUsed: '2024-01-15',
    requestCount: 8750,
    rateLimit: '2000/hour',
    ipWhitelist: ['198.51.100.0', '203.0.113.100'],
  },
  {
    id: 'api_key_4',
    name: 'Mobile Plus Development',
    keyPreview: 'sk_dev_6464646464646464',
    reseller: {
      name: 'Emily Brown',
      storeName: 'Mobile Plus',
      email: 'emily@mobileplus.com'
    },
    status: 'Active',
    environment: 'Development',
    permissions: ['read:products'],
    createdDate: '2024-01-20',
    lastUsed: '2024-01-21',
    requestCount: 156,
    rateLimit: '100/hour',
    ipWhitelist: ['127.0.0.1'],
  },
  {
    id: 'api_key_5',
    name: 'Tech Solutions Production',
    keyPreview: 'sk_live_7575757575757575',
    reseller: {
      name: 'David Wilson',
      storeName: 'Tech Solutions',
      email: 'david@techsolutions.com'
    },
    status: 'Expired',
    environment: 'Production',
    permissions: ['read:products', 'write:orders', 'read:customers', 'read:analytics'],
    createdDate: '2023-12-01',
    lastUsed: '2024-01-01',
    requestCount: 45230,
    rateLimit: '5000/hour',
    ipWhitelist: ['192.0.2.0', '198.51.100.50'],
  },
];

const webhooks = [
  {
    id: 'webhook_1',
    name: 'Order Created Webhook',
    url: 'https://techstorenyc.com/webhooks/orders',
    events: ['order.created', 'order.updated'],
    status: 'Active',
    reseller: 'TechStore NYC',
    lastTriggered: '2024-01-21',
    successRate: 98.5,
    totalCalls: 1250,
  },
  {
    id: 'webhook_2',
    name: 'Product Update Webhook',
    url: 'https://electronicshub.com/api/products',
    events: ['product.updated', 'product.created'],
    status: 'Failed',
    reseller: 'Electronics Hub',
    lastTriggered: '2024-01-20',
    successRate: 45.2,
    totalCalls: 340,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Suspended':
      return 'bg-red-100 text-red-800';
    case 'Expired':
      return 'bg-gray-100 text-gray-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Active':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'Suspended':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'Expired':
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
    case 'Failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
}

function getEnvironmentColor(environment: string) {
  switch (environment) {
    case 'Production':
      return 'bg-red-100 text-red-800';
    case 'Test':
      return 'bg-yellow-100 text-yellow-800';
    case 'Development':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function ActionMenu({ apiKey }: { apiKey: { id: string; name: string; status: string } }) {
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
              View Details
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
              <Copy className="h-4 w-4 mr-2" />
              Copy API Key
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
              Edit Permissions
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-blue-600' : 'text-blue-600'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Key
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
              Revoke Key
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function APIIntegrationPage() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [environmentFilter, setEnvironmentFilter] = useState('All');

  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.reseller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.reseller.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || key.status === statusFilter;
    const matchesEnvironment = environmentFilter === 'All' || key.environment === environmentFilter;
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requestCount, 0);
  const activeKeys = apiKeys.filter(key => key.status === 'Active').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Integration</h1>
            <p className="text-gray-600 mt-1">Manage API keys, webhooks, and integrations</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Documentation
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total API Keys</p>
                <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold text-gray-900">{activeKeys}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Code className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'api-keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                API Keys
              </button>
              <button
                onClick={() => setActiveTab('webhooks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'webhooks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Webhooks
              </button>
              <button
                onClick={() => setActiveTab('documentation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documentation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documentation
              </button>
            </nav>
          </div>

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="p-6">
              {/* Filters and Search */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search API keys..."
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
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Expired">Expired</option>
                    </select>
                    <select
                      value={environmentFilter}
                      onChange={(e) => setEnvironmentFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All">All Environments</option>
                      <option value="Production">Production</option>
                      <option value="Test">Test</option>
                      <option value="Development">Development</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* API Keys Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reseller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Environment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                              <Key className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                              <div className="text-xs text-gray-500 font-mono">{apiKey.keyPreview}...</div>
                              <div className="text-xs text-gray-400">
                                {apiKey.permissions.length} permission{apiKey.permissions.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{apiKey.reseller.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {apiKey.reseller.storeName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnvironmentColor(apiKey.environment)}`}>
                            {apiKey.environment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {apiKey.requestCount.toLocaleString()} requests
                          </div>
                          <div className="text-xs text-gray-500">
                            Limit: {apiKey.rateLimit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(apiKey.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(apiKey.status)}`}>
                              {apiKey.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {apiKey.lastUsed}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created: {apiKey.createdDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ActionMenu apiKey={apiKey} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Code className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Webhooks Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure and monitor webhook endpoints for real-time notifications.
                </p>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'documentation' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Code className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">API Documentation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete API reference and integration guides for developers.
                </p>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto">
                    <Eye className="h-4 w-4 mr-2" />
                    View Documentation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

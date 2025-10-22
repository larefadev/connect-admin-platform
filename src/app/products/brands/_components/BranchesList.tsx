import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Star, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Building2,
  Power,
  PowerOff
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import { ProviderBranch } from '@/core/providers';

interface BranchesListProps {
  branches: ProviderBranch[];
  loading: boolean;
  onAddBranch: () => void;
  onEditBranch: (branch: ProviderBranch) => void;
  onDeleteBranch: (branch: ProviderBranch) => void;
  onToggleStatus: (branchId: number, isActive: boolean) => Promise<boolean>;
  onSetMainBranch: (branchId: number) => Promise<boolean>;
}

function BranchActionMenu({ 
  branch, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSetMainBranch 
}: { 
  branch: ProviderBranch;
  onEdit: (branch: ProviderBranch) => void;
  onDelete: (branch: ProviderBranch) => void;
  onToggleStatus: (branchId: number, isActive: boolean) => Promise<boolean>;
  onSetMainBranch: (branchId: number) => Promise<boolean>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    if (!branch.id) return;
    setIsLoading(true);
    try {
      await onToggleStatus(branch.id, !branch.is_active);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMainBranch = async () => {
    if (!branch.id || branch.is_main_branch) return;
    setIsLoading(true);
    try {
      await onSetMainBranch(branch.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg" disabled={isLoading}>
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onEdit(branch)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          )}
        </Menu.Item>
        
        {!branch.is_main_branch && (
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleSetMainBranch}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-yellow-600' : 'text-yellow-600'
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                Marcar como Principal
              </button>
            )}
          </Menu.Item>
        )}
        
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={handleToggleStatus}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50' : ''
              } ${branch.is_active ? 'text-orange-600' : 'text-green-600'}`}
            >
              {branch.is_active ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </button>
          )}
        </Menu.Item>
        
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onDelete(branch)}
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

export function BranchesList({
  branches,
  loading,
  onAddBranch,
  onEditBranch,
  onDeleteBranch,
  onToggleStatus,
  onSetMainBranch
}: BranchesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBranches = branches.filter(branch =>
    branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.contact_person && branch.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeBranches = filteredBranches.filter(b => b.is_active);
  const inactiveBranches = filteredBranches.filter(b => !b.is_active);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-gray-400" />
              Sucursales ({branches.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {activeBranches.length} activas • {inactiveBranches.length} inactivas
            </p>
          </div>
          <button
            onClick={onAddBranch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Sucursal
          </button>
        </div>

        {/* Search */}
        {branches.length > 0 && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar sucursales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredBranches.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {branches.length === 0 ? 'No hay sucursales' : 'No se encontraron sucursales'}
            </h4>
            <p className="text-gray-500 mb-4">
              {branches.length === 0 
                ? 'Comienza agregando la primera sucursal de este proveedor.'
                : 'Intenta con otros términos de búsqueda.'
              }
            </p>
            {branches.length === 0 && (
              <button
                onClick={onAddBranch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Sucursal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className={`border rounded-lg p-4 transition-all ${
                  branch.is_active 
                    ? 'border-gray-200 bg-white hover:shadow-md' 
                    : 'border-gray-200 bg-gray-50'
                } ${branch.is_main_branch ? 'ring-2 ring-yellow-200' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center">
                        {branch.branch_name}
                        {branch.is_main_branch && (
                          <div className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </div>
                        )}
                      </h4>
                      <div className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        branch.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.is_active ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{branch.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">{branch.city}</span>
                          {branch.postal_code && (
                            <span className="ml-2 text-gray-500">C.P. {branch.postal_code}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {branch.contact_person && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{branch.contact_person}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{branch.phone}</span>
                        </div>
                        {branch.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{branch.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {branch.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{branch.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <BranchActionMenu
                      branch={branch}
                      onEdit={onEditBranch}
                      onDelete={onDeleteBranch}
                      onToggleStatus={onToggleStatus}
                      onSetMainBranch={onSetMainBranch}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

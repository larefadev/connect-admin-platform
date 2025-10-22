import { MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { Person } from '@/core/sellers/Entities/Person';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditResellerModal } from './EditResellerModal';
import { DeleteResellerModal } from './DeleteResellerModal';

interface ResellerActionMenuProps {
  reseller: Person;
  onStatusChange?: (sellerId: bigint | undefined, newStatus: boolean) => Promise<boolean>;
  onDelete?: (sellerId: bigint | undefined) => Promise<boolean>;
  onEdit?: (reseller: Person, updatedData: Partial<Person>) => Promise<boolean>;
  onViewDetails?: (reseller: Person) => void;
}

export function ResellerActionMenu({ 
  reseller, 
  onStatusChange, 
  onDelete, 
  onEdit, 
  onViewDetails 
}: ResellerActionMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleStatusChange = async () => {
    if (!onStatusChange) return;
    
    setIsLoading(true);
    try {
      const success = await onStatusChange(reseller.id, !reseller.status);
      if (success) {
        // Mostrar notificación de éxito si es necesario
        console.log(`Usuario ${reseller.status ? 'desactivado' : 'activado'} exitosamente`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sellerId: bigint | undefined) => {
    if (!onDelete) return false;
    
    setIsLoading(true);
    try {
      const success = await onDelete(sellerId);
      if (success) {
        console.log('Usuario eliminado exitosamente');
      }
      return success;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(reseller);
    } else {
      // Redirigir a la página de detalles
      router.push(`/users/resellers/${reseller.id}`);
    }
  };

  const handleEdit = async (reseller: Person, updatedData: Partial<Person>) => {
    if (!onEdit) return false;
    
    setIsLoading(true);
    try {
      const success = await onEdit(reseller, updatedData);
      if (success) {
        console.log('Usuario actualizado exitosamente');
      }
      return success;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg">
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={handleViewDetails}
              disabled={isLoading}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => setIsEditModalOpen(true)}
              disabled={isLoading}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          )}
        </Menu.Item>
        
        <div className="border-t border-gray-100 my-1"></div>
        
        {reseller.status ? (
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleStatusChange}
                disabled={isLoading}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-red-600' : 'text-red-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UserX className="h-4 w-4 mr-2" />
                {isLoading ? 'Desactivando...' : 'Desactivar'}
              </button>
            )}
          </Menu.Item>
        ) : (
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleStatusChange}
                disabled={isLoading}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-green-600' : 'text-green-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {isLoading ? 'Activando...' : 'Activar'}
              </button>
            )}
          </Menu.Item>
        )}
        
        <div className="border-t border-gray-100 my-1"></div>
        
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isLoading}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-red-600' : 'text-red-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
      
      {/* Modals */}
      <EditResellerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        reseller={reseller}
        onSave={handleEdit}
        isLoading={isLoading}
      />
      
      <DeleteResellerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        reseller={reseller}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </Menu>
  );
}

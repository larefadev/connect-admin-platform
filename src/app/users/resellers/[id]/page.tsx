'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
 
  Calendar, 
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import { Person } from '@/core/sellers/Entities/Person';
import { useSeller } from '@/core/sellers';
import { EditResellerModal } from '../_components/EditResellerModal';
import { DeleteResellerModal } from '../_components/DeleteResellerModal';

export default function ResellerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getSellerById, updateSeller, deleteSeller } = useSeller();
  
  const [reseller, setReseller] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const sellerId = params.id as string;

  useEffect(() => {
    const fetchReseller = async () => {
      if (!sellerId) return;
      
      setLoading(true);
      try {
        const seller = await getSellerById(BigInt(sellerId));
        setReseller(seller);
      } catch (err) {
        setError('Error al cargar la información del revendedor');
        console.error('Error fetching reseller:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReseller();
  }, [sellerId, getSellerById]);

  const handleStatusChange = async () => {
    if (!reseller) return;
    
    setActionLoading(true);
    try {
      const updatedData = { status: !reseller.status };
      const success = await updateSeller(reseller, updatedData);
      if (success) {
        setReseller(prev => prev ? { ...prev, status: !prev.status } : null);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (reseller: Person, updatedData: Partial<Person>) => {
    setActionLoading(true);
    try {
      const success = await updateSeller(reseller, updatedData);
      if (success) {
        setReseller(prev => prev ? { ...prev, ...updatedData } : null);
      }
      return success;
    } catch (error) {
      console.error('Error al actualizar:', error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (sellerId: bigint | undefined) => {
    if (!sellerId) return false;
    
    setActionLoading(true);
    try {
      const success = await deleteSeller(sellerId);
      if (success) {
        router.push('/users/resellers');
      }
      return success;
    } catch (error) {
      console.error('Error al eliminar:', error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !reseller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Revendedor no encontrado'}
          </h2>
          <button
            onClick={() => router.push('/users/resellers')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const displayName = reseller.name && reseller.last_name 
    ? `${reseller.name} ${reseller.last_name}`.trim()
    : reseller.name || reseller.username;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/users/resellers')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detalles del Revendedor
                </h1>
                <p className="text-sm text-gray-500">
                  Información completa de {displayName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              
              <button
                onClick={handleStatusChange}
                disabled={actionLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  reseller.status
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {reseller.status ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Desactivando...' : 'Desactivar'}
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Activando...' : 'Activar'}
                  </>
                )}
              </button>
              
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                {reseller.profile_image ? (
                  <img 
                    className="h-32 w-32 rounded-full object-cover mx-auto" 
                    src={reseller.profile_image} 
                    alt={`${displayName} profile`}
                  />
                ) : (
                  <div className="h-32 w-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-3xl font-medium text-gray-700">
                      {reseller.name ? reseller.name.charAt(0).toUpperCase() : reseller.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-500">@{reseller.username}</p>
                
                <div className="mt-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    reseller.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <Shield className="h-4 w-4 mr-1" />
                    {reseller.status ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Personal
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="text-sm text-gray-900">{reseller.name || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Apellido</p>
                      <p className="text-sm text-gray-900">{reseller.last_name || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{reseller.email}</p>
                    </div>
                  </div>
                  
                  
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                      <p className="text-sm text-gray-900">
                        {reseller.created_at ? formatDate(reseller.created_at) : 'No disponible'}
                      </p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditResellerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        reseller={reseller}
        onSave={handleEdit}
        isLoading={actionLoading}
      />
      
      <DeleteResellerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        reseller={reseller}
        onConfirm={handleDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}

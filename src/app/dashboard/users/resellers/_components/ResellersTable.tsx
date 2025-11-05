import Image from 'next/image';
import { Person } from '@/core/sellers/interface/Person';
import { ResellerActionMenu } from './ResellerActionMenu';

interface ResellersTableProps {
  resellers: Person[];
  onStatusChange?: (sellerId: bigint | undefined, newStatus: boolean) => Promise<boolean>;
  onDelete?: (sellerId: bigint | undefined) => Promise<boolean>;
  onEdit?: (reseller: Person, updatedData: Partial<Person>) => Promise<boolean>;
  onViewDetails?: (reseller: Person) => void;
}

function getStatusColor(status: boolean) {
  return status 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
}

function getStatusText(status: boolean) {
  return status ? 'Activo' : 'Inactivo';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getCity(reseller: Person): string {
  const storeProfile = reseller.StoreProfile;
  
  if (!storeProfile) {
    return 'N/A';
  }
  
  // Prioridad 1: municipality
  if (storeProfile.municipality && storeProfile.municipality.trim() !== '') {
    return storeProfile.municipality.trim();
  }
  
  // Prioridad 2: city (campo directo)
  if (storeProfile.city && storeProfile.city.trim() !== '') {
    return storeProfile.city.trim();
  }
  
  // Prioridad 3: city.name desde la relación adress -> city
  if (storeProfile.adress?.city?.name && storeProfile.adress.city.name.trim() !== '') {
    return storeProfile.adress.city.name.trim();
  }
  
  return 'N/A';
}

function getPostalCode(reseller: Person): string {
  const storeProfile = reseller.StoreProfile;
  
  if (!storeProfile) {
    return 'N/A';
  }
  
  // Código postal desde store_profile
  if (storeProfile.postal_code && storeProfile.postal_code.trim() !== '') {
    return storeProfile.postal_code.trim();
  }
  
  return 'N/A';
}

export function ResellersTable({ 
  resellers, 
  onStatusChange, 
  onDelete, 
  onEdit, 
  onViewDetails 
}: ResellersTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revendedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ciudad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código Postal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resellers.map((reseller) => (
              <tr key={reseller.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {reseller.profile_image ? (
                      <Image 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={reseller.profile_image} 
                        alt={`${reseller.name || reseller.username} profile`}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {reseller.name ? reseller.name.charAt(0).toUpperCase() : reseller.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {reseller.name && reseller.last_name 
                          ? `${reseller.name} ${reseller.last_name}`.trim()
                          : reseller.name || reseller.username
                        }
                      </div>
                      <div className="text-sm text-gray-500">{reseller.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCity(reseller)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getPostalCode(reseller)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reseller.status)}`}>
                    {getStatusText(reseller.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reseller.created_at ? formatDate(reseller.created_at) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ResellerActionMenu 
                    reseller={reseller}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onViewDetails={onViewDetails}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

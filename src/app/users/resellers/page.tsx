'use client';

import { useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { ResellersFilters, ResellersTable, Pagination } from './_components';
import { useSeller } from '@/core/sellers/useSellers';
import { Person } from '@/core/sellers/Entities/Person';


const resellers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    status: 'Activo',
    joinDate: '2024-01-15',
    totalSales: '$12,450',
    commission: '15%',
    location: 'New York, NY',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    status: 'Activo',
    joinDate: '2024-01-10',
    totalSales: '$8,920',
    commission: '12%',
    location: 'Los Angeles, CA',
  },
  {
    id: 3,
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    phone: '+1 (555) 456-7890',
    status: 'Inactivo',
    joinDate: '2023-12-20',
    totalSales: '$5,670',
    commission: '10%',
    location: 'Chicago, IL',
  },
  {
    id: 4,
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    phone: '+1 (555) 321-0987',
    status: 'Pendiente',
    joinDate: '2024-01-18',
    totalSales: '$0',
    commission: '15%',
    location: 'Houston, TX',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+1 (555) 654-3210',
    status: 'Activo',
    joinDate: '2023-11-05',
    totalSales: '$18,340',
    commission: '18%',
    location: 'Miami, FL',
  },
];

export default function ResellersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const { sellers, updateSellerStatus, deleteSeller, updateSeller } = useSeller();

  const ITEMS_PER_PAGE = 7;

  // Filtrar vendedores basado en búsqueda y estado
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = (seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          seller.email?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false;
    
    const matchesStatus = statusFilter === 'Todos' || 
                         (statusFilter === 'Activo' && seller.status) ||
                         (statusFilter === 'Inactivo' && !seller.status);
    
    return matchesSearch && matchesStatus;
  });

  // Calcular paginación
  const totalItems = filteredSellers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSellers = filteredSellers.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditReseller = async (reseller: Person, updatedData: Partial<Person>) => {
    return await updateSeller(reseller, updatedData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ResellersFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />

        <ResellersTable 
          resellers={paginatedSellers}
          onStatusChange={updateSellerStatus}
          onDelete={deleteSeller}
          onEdit={handleEditReseller}
        />

        <Pagination 
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>
    </DashboardLayout>
  );
}

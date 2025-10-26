'use client';

import { useState } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { ResellersFilters, ResellersTable, Pagination } from './_components';
import { useSeller } from '@/core/sellers/application/useSellers';
import { Person } from '@/core/sellers/interface/Person';



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

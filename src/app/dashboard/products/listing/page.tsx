'use client';
import { useState, useCallback } from 'react';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import CreateProductModal from '@/shared/components/modals/CreateProductModal';
import BulkStockUpdateModal from '@/shared/components/modals/BulkStockUpdateModal';
import BulkImportModal from '@/shared/components/modals/BulkImportModal';
import EditProductModal from '@/shared/components/modals/EditProductModal';
import UpdateInventoryModal from '@/shared/components/modals/UpdateInventoryModal';
import BulkAutoPartTypeModal from '@/shared/components/modals/BulkAutoPartTypeModal';
import { useRouter } from 'next/navigation';
import { HeaderPage } from './_components/HeaderPage';
import { StatCard } from './_components/StatCard';
import { FilterSearch } from './_components/FilterSearch';
import { ProductsTable } from './_components/ProductsTable';
import { Pagination } from './_components/Pagination';
import { Product } from '@/core/products/interface/Product';
import { useProducts, ProductFilters } from '@/core/products/application/useProducts';
// Product interface imported from useProducts hook

interface InventoryEntry {
  id?: number;
  product_sku: string;
  provider_branch_id: number;
  stock: number;
  reserved_stock?: number;
}

export default function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isAutoPartTypeModalOpen, setIsAutoPartTypeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const router = useRouter();

  // Hook calls must be inside the component
  const { 
    products, 
    paginatedProducts,
    loading, 
    filtering,
    error, 
    totalItems, 
    totalPages,
    currentPage, 
    itemsPerPage, 
    createProduct, 
    deleteProduct, 
    updateProduct,
    toggleProductVisibility,
    bulkStockUpdate, 
    bulkImport, 
    filterProducts,
    searchProducts,
    getSearchSuggestions,
    handlePageChange,
    refreshProducts
  } = useProducts();
  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle view product details
  const handleViewDetails = (product: Product) => {
    router.push(`/dashboard/products/${product.SKU}`);
  };

  // Handle update inventory
  const handleUpdateInventory = (product: Product) => {
    setSelectedProduct(product);
    setIsInventoryModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
      deleteProduct(product.SKU);
    }
  };

  // Handle toggle product visibility
  const handleToggleVisibility = async (product: Product) => {
    try {
      const currentVisibility = product.is_visible !== false; // Default true si no está definido
      await toggleProductVisibility(product.SKU, currentVisibility);
    } catch (error) {
      console.error('Error al cambiar visibilidad del producto:', error);
      // El error ya se maneja en el hook, pero podemos mostrar un mensaje adicional si es necesario
    }
  };

  // Handle product update
  const handleUpdateProduct = async (productData: Product) => {
    updateProduct(productData.SKU, productData);
  };

  // Handle inventory update for single product
  const handleInventoryUpdate = async (inventoryEntries: InventoryEntry[]) => {
    console.log('🔄 Actualizando inventario del producto:', inventoryEntries);

    try {
      // Import Supabase client
      const { default: supabase } = await import('@/lib/Supabase');

      for (const entry of inventoryEntries) {
        console.log(`Actualizando inventario: ${entry.product_sku} en sucursal ${entry.provider_branch_id}: ${entry.stock} unidades`);

        if (entry.id) {
          // Update existing entry
          const { error } = await supabase
            .from('inventory')
            .update({
              stock: entry.stock,
              reserved_stock: entry.reserved_stock || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);

          if (error) {
            console.error('Error updating inventory entry:', error);
            throw new Error(`Error actualizando inventario: ${error.message}`);
          }
        } else {
          // Insert new entry
          const { error } = await supabase
            .from('inventory')
            .insert({
              product_sku: entry.product_sku,
              provider_branch_id: entry.provider_branch_id,
              stock: entry.stock,
              reserved_stock: entry.reserved_stock || 0
            });

          if (error) {
            console.error('Error inserting inventory entry:', error);
            throw new Error(`Error creando inventario: ${error.message}`);
          }
        }
      }

      console.log('✅ Inventario actualizado exitosamente');

      // Close modal and clear selection
      setIsInventoryModalOpen(false);
      setSelectedProduct(null);

      // Nota: No necesitamos recargar productos aquí porque el inventario
      // no afecta la lista de productos mostrada. El inventario se maneja
      // separadamente en las páginas de detalle.

    } catch (error) {
      console.error('❌ Error actualizando inventario:', error);
      throw error;
    }
  };

  // Handle bulk stock update
  const handleBulkStockUpdate = async (
    updates: { provider_sku: string; provider_branch_id: number; stock: number; reserved_stock?: number }[],
    onProgress?: (progress: { current: number; total: number; updated: number; created: number; skipped: number }) => void,
    signal?: AbortSignal
  ) => {
    console.log('🔄 Actualizando stock masivamente:', updates);

    try {
      await bulkStockUpdate(updates, onProgress, signal);
      console.log('✅ Stock actualizado exitosamente');
    } catch (error) {
      // No hacer log de cancelaciones (AbortError)
      const isCancelled = error instanceof DOMException && error.name === 'AbortError' ||
                         error instanceof Error && error.name === 'AbortError';
      
      if (!isCancelled) {
        console.error('❌ Error actualizando stock:', error);
      }
      throw error;
    }
  };

  // Handle bulk import
  const handleBulkImport = async (products: Product[]) => {
    console.log('🔄 Importando productos masivamente:', products);

    try {
      await bulkImport(products);
      console.log('✅ Productos importados exitosamente');
    } catch (error) {
      console.error('❌ Error importando productos:', error);
      throw error;
    }
  };

  // Handle filters change - memoized to prevent infinite loops
  const handleFiltersChange = useCallback((filters: ProductFilters) => {
    console.log('🔍 Aplicando filtros:', filters);
    // Reset to page 1 when applying new filters
    filterProducts({ ...filters, page: 1 });
  }, [filterProducts]);

  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    console.log('🔍 Ejecutando búsqueda:', searchTerm);
    searchProducts(searchTerm);
  }, [searchProducts]);

  // Handle error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <HeaderPage
          setIsCreateModalOpen={setIsCreateModalOpen}
          setIsStockUpdateModalOpen={setIsStockUpdateModalOpen}
          setIsBulkImportModalOpen={setIsBulkImportModalOpen}
          setIsAutoPartTypeModalOpen={setIsAutoPartTypeModalOpen}
        />

        {/* Stats Cards */}
        <StatCard 
          count={products.length} 
          onRefresh={refreshProducts}
          isRefreshing={loading}
        />


        {/* Filters and Search */}
        <FilterSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onFiltersChange={handleFiltersChange}
          getSearchSuggestions={getSearchSuggestions}
          onSearch={handleSearch} />

        {/* Products Table */}
        <ProductsTable
          handleEditProduct={handleEditProduct}
          handleViewDetails={handleViewDetails}
          handleUpdateInventory={handleUpdateInventory}
          handleDeleteProduct={handleDeleteProduct}
          handleToggleVisibility={handleToggleVisibility}
          products={paginatedProducts}
          loading={loading || filtering}
        />
        {/* Pagination */}
        <Pagination 
          totalItems={totalItems} 
          totalPages={totalPages}
          currentPage={currentPage} 
          itemsPerPage={itemsPerPage} 
          onPageChange={handlePageChange} 
        />
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createProduct}
      />

      {/* Bulk Stock Update Modal */}
      <BulkStockUpdateModal
        isOpen={isStockUpdateModalOpen}
        onClose={() => setIsStockUpdateModalOpen(false)}
        onUpdate={handleBulkStockUpdate}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImport={handleBulkImport}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleUpdateProduct}
        product={selectedProduct}
      />

      {/* Update Inventory Modal */}
      {selectedProduct && (
        <UpdateInventoryModal
          isOpen={isInventoryModalOpen}
          onClose={() => {
            setIsInventoryModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleInventoryUpdate}
          product={selectedProduct}
        />
      )}

      {/* Bulk Auto Part Type Assignment Modal */}
      <BulkAutoPartTypeModal
        isOpen={isAutoPartTypeModalOpen}
        onClose={() => setIsAutoPartTypeModalOpen(false)}
        onUpdate={() => filterProducts({})}
      />
    </DashboardLayout>
  );
}

'use client';
import { useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { useProducts, type Product } from '@/core/products/application/use-cases/useProducts';
import CreateProductModal from '@/shared/components/modals/CreateProductModal';
import BulkStockUpdateModal from '@/shared/components/modals/BulkStockUpdateModal';
import BulkImportModal from '@/shared/components/modals/BulkImportModal';
import EditProductModal from '@/shared/components/modals/EditProductModal';
import UpdateInventoryModal from '@/shared/components/modals/UpdateInventoryModal';
import { useRouter } from 'next/navigation';

import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Upload
} from 'lucide-react';
import { Menu } from '@headlessui/react';

// Product interface imported from useProducts hook

interface InventoryEntry {
  id?: number;
  product_sku: string;
  provider_branch_id: number;
  stock: number;
  reserved_stock?: number;
}

interface ActionMenuProps {
  product: Product;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onUpdateInventory: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function ActionMenu({ product, onEdit, onViewDetails, onUpdateInventory, onDelete }: ActionMenuProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg">
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onViewDetails(product)}
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
              onClick={() => onEdit(product)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Producto
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onUpdateInventory(product)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              Actualizar Inventario
            </button>
          )}
        </Menu.Item>
        <div className="border-t border-gray-100 my-1"></div>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => onDelete(product)}
              className={`w-full flex items-center px-4 py-2 text-sm ${
                active ? 'bg-red-50 text-red-600' : 'text-red-600'
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Producto
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const router = useRouter();
  
  // Hook calls must be inside the component
  const { products, loading, error, createProduct } = useProducts();

  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle view product details
  const handleViewDetails = (product: Product) => {
    router.push(`/products/${product.SKU}`);
  };

  // Handle update inventory
  const handleUpdateInventory = (product: Product) => {
    setSelectedProduct(product);
    setIsInventoryModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
      console.log('🗑️ Eliminando producto:', product.SKU);
      
      // TODO: Implement actual Supabase delete operation
      // await supabase
      //   .from('products_test')
      //   .delete()
      //   .eq('SKU', product.SKU);
      
      // Also delete related inventory
      // await supabase
      //   .from('inventory')
      //   .delete()
      //   .eq('product_sku', product.SKU);
      
      alert('Producto eliminado exitosamente');
    }
  };

  // Handle product update
  const handleUpdateProduct = async (productData: Product) => {
    console.log('🔄 Actualizando producto:', productData);
    
    try {
      // TODO: Implement actual Supabase update operation
      // await supabase
      //   .from('products_test')
      //   .update({
      //     name: productData.name,
      //     description: productData.description,
      //     price: productData.price,
      //     image: productData.image,
      //     category: productData.category,
      //     brand: productData.brand,
      //     brand_code: productData.brand_code,
      //     provider: productData.provider,
      //     provider_id: productData.provider_id
      //   })
      //   .eq('SKU', productData.SKU);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('✅ Producto actualizado exitosamente');
      
      // Close modal and clear selection
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      throw error;
    }
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
      
    } catch (error) {
      console.error('❌ Error actualizando inventario:', error);
      throw error;
    }
  };

  // Handle bulk stock update
  const handleBulkStockUpdate = async (updates: { product_sku: string; provider_branch_id: number; stock: number; reserved_stock?: number }[]) => {
    console.log('🔄 Actualizando stock masivamente:', updates);
    
    try {
      // TODO: Implement actual Supabase operations
      // For each update, either INSERT or UPDATE in inventory table
      for (const update of updates) {
        console.log(`Actualizando ${update.product_sku} en sucursal ${update.provider_branch_id}: ${update.stock} unidades`);
        
        // Example Supabase operation (to be implemented):
        // await supabase
        //   .from('inventory')
        //   .upsert({
        //     product_sku: update.product_sku,
        //     provider_branch_id: update.provider_branch_id,
        //     stock: update.stock,
        //     reserved_stock: update.reserved_stock || 0,
        //     updated_at: new Date().toISOString()
        //   }, { 
        //     onConflict: 'product_sku,provider_branch_id' 
        //   });
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Stock actualizado exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando stock:', error);
      throw error;
    }
  };

  // Handle bulk import
  const handleBulkImport = async (products: Product[]) => {
    console.log('🔄 Importando productos masivamente:', products);
    
    try {
      // TODO: Implement actual Supabase operations
      // Insert products into products_test table
      for (const product of products) {
        console.log(`Importando producto: ${product.SKU} - ${product.name}`);
        
        // Example Supabase operation (to be implemented):
        // await supabase
        //   .from('products_test')
        //   .insert({
        //     "SKU": product.SKU,
        //     name: product.name,
        //     description: product.description,
        //     price: product.price,
        //     image: product.image,
        //     category: product.category,
        //     brand: product.brand,
        //     brand_code: product.brand_code,
        //     provider: product.provider,
        //     provider_id: product.provider_id
        //   });
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Productos importados exitosamente');
      
    } catch (error) {
      console.error('❌ Error importando productos:', error);
      throw error;
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando productos...</div>
        </div>
      </DashboardLayout>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600 mt-1">Gestiona tu inventario de productos</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </button>
            <button 
              onClick={() => setIsStockUpdateModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              Actualizar Stock
            </button>
            <button 
              onClick={() => setIsBulkImportModalOpen(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carga Masiva
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Productos</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
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
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todas">Todas las Categorías</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Dispositivos Portátiles">Dispositivos Portátiles</option>
                <option value="Accesorios">Accesorios</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Activo">Activo</option>
                <option value="Stock Bajo">Stock Bajo</option>
                <option value="Sin Stock">Sin Stock</option>
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

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={product.SKU || `product-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <Image 
                              src={product.image} 
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package className={`h-6 w-6 text-gray-400 ${product.image ? 'hidden' : ''}`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">SKU: {product.SKU}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.SKU}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${product.price?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.brand || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.provider || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu 
                        product={product} 
                        onEdit={handleEditProduct}
                        onViewDetails={handleViewDetails}
                        onUpdateInventory={handleUpdateInventory}
                        onDelete={handleDeleteProduct}
                      />
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de{' '}
                <span className="font-medium">{products.length}</span> resultados
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
    </DashboardLayout>
  );
}

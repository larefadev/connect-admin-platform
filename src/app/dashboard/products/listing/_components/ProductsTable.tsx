import { Package, Star } from 'lucide-react';
import Image from 'next/image';
import { ActionMenu } from './ActionMenu';
import { Product } from '@/core/products/interface/Product';

interface ProductsTableProps {
  handleEditProduct: (product: Product) => void
  handleViewDetails: (product: Product) => void
  handleUpdateInventory: (product: Product) => void
  handleDeleteProduct: (product: Product) => void
  handleToggleVisibility: (product: Product) => void
  products: Product[]
  loading: boolean
}

export const ProductsTable = (
  { 
    handleEditProduct, 
    handleViewDetails,
    handleUpdateInventory,
    handleDeleteProduct,
    handleToggleVisibility,
    products, 
    loading 
  }: ProductsTableProps) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando un nuevo producto al catálogo
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.SKU || `product-${index}`} className="hover:bg-gray-50 transition-colors">
                  {/* Columna: Producto (imagen + nombre + SKU) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <div className="text-xs text-gray-500">SKU: {product.SKU}</div>
                      </div>
                    </div>
                  </td>

                  {/* Columna: Categoría */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.category || '-'}
                    </div>
                  </td>

                  {/* Columna: Marca */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.brand || '-'}
                    </div>
                  </td>

                  {/* Columna: Precio */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${product.price?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </td>

                  {/* Columna: Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(product.totalStock ?? 0).toLocaleString('es-MX')}
                    </div>
                  </td>

                  {/* Columna: Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_visible !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_visible !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Columna: Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionMenu
                      product={product}
                      onEdit={handleEditProduct}
                      onViewDetails={handleViewDetails}
                      onUpdateInventory={handleUpdateInventory}
                      onDelete={handleDeleteProduct}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import supabase from '@/lib/Supabase';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Tag, 
  Building2, 
  User, 
  Image as ImageIcon,
  Edit,
  Trash2,
  BarChart3,
  MapPin,
  Calendar
} from 'lucide-react';

interface ProductDetail {
  SKU: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  brand?: string;
  brand_code?: string;
  provider?: string;
  provider_id?: number;
}

interface InventoryItem {
  id: number;
  provider_branch_id: number;
  branch_name: string;
  city: string;
  provider_name: string;
  stock: number;
  reserved_stock: number;
  updated_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sku = params.sku as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (sku) {
      loadProductData();
    }
  }, [sku]);

  const loadProductData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Load real product data from Supabase products_test table
      const { data: productData, error: productError } = await supabase
        .from('products_test')
        .select('*')
        .eq('SKU', sku)
        .single();

      if (productError) {
        console.error('Error loading product:', productError);
        if (productError.code === 'PGRST116') {
          throw new Error(`Producto con SKU "${sku}" no encontrado`);
        }
        throw new Error('Error al cargar el producto');
      }

      if (!productData) {
        throw new Error(`Producto con SKU "${sku}" no encontrado`);
      }

      // Load inventory data for this product
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          *,
          provider_branches!inner(
            branch_name,
            city,
            provider:provider_id(name)
          )
        `)
        .eq('product_sku', sku);

      if (inventoryError) {
        console.error('Error loading inventory:', inventoryError);
      }

      // Transform inventory data
      const inventory: InventoryItem[] = inventoryData?.map((item: any) => ({
        id: item.id,
        provider_branch_id: item.provider_branch_id,
        branch_name: item.provider_branches?.branch_name || 'Sin nombre',
        city: item.provider_branches?.city || 'Sin ciudad',
        provider_name: item.provider_branches?.provider?.name || 'Sin proveedor',
        stock: item.stock || 0,
        reserved_stock: item.reserved_stock || 0,
        updated_at: item.updated_at
      })) || [];

      console.log('Producto cargado:', productData);
      console.log('Imagen del producto:', productData.image);
      
      setProduct(productData);
      setInventory(inventory);

    } catch (err) {
      setError('Error al cargar los detalles del producto');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit product:', product?.SKU);
  };

  const handleDelete = () => {
    // TODO: Show confirmation dialog and delete product
    console.log('Delete product:', product?.SKU);
  };

  const getTotalStock = () => {
    return inventory.reduce((total, item) => total + item.stock, 0);
  };

  const getAvailableStock = () => {
    return inventory.reduce((total, item) => total + (item.stock - item.reserved_stock), 0);
  };

  const getReservedStock = () => {
    return inventory.reduce((total, item) => total + item.reserved_stock, 0);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando producto...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Producto no encontrado</h3>
          <p className="text-gray-500 mb-4">{error || 'El producto solicitado no existe'}</p>
          <button
            onClick={() => router.push('/products/listing')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al Catálogo
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/products/listing')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.SKU}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Producto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Precio</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Categoría</p>
                      <p className="font-medium">{product.category || 'Sin categoría'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Marca</p>
                      <p className="font-medium">{product.brand || 'Sin marca'}</p>
                      {product.brand_code && (
                        <p className="text-xs text-gray-500">Código: {product.brand_code}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Proveedor</p>
                      <p className="font-medium">{product.provider || 'Sin proveedor'}</p>
                      {product.provider_id && (
                        <p className="text-xs text-gray-500">ID: {product.provider_id}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">SKU</p>
                      <p className="font-medium font-mono">{product.SKU}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            {product.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Descripción</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Inventory Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Inventario por Sucursal</h3>
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Actualizar Inventario
                </button>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay inventario registrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{item.branch_name}</p>
                            <p className="text-sm text-gray-500">{item.city} • {item.provider_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            {item.stock - item.reserved_stock} disponibles
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.stock} total • {item.reserved_stock} reservado
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        Actualizado: {new Date(item.updated_at).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen</h3>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Stock Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Inventario</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Total:</span>
                  <span className="font-semibold">{getTotalStock()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponible:</span>
                  <span className="font-semibold text-green-600">{getAvailableStock()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reservado:</span>
                  <span className="font-semibold text-orange-600">{getReservedStock()}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sucursales:</span>
                    <span className="font-semibold">{inventory.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

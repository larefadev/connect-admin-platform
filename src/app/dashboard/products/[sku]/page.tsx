'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import supabase from '@/lib/Supabase';
import EditProductModal from '@/shared/components/modals/EditProductModal';
import { Product } from '@/core/products/interface/Product';
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
  Calendar,
  AlertTriangle,
  Link as LinkIcon,
  Plus,
  ExternalLink
} from 'lucide-react';
import AddCrossReferenceModal from '@/shared/components/modals/AddCrossReferenceModal';

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
  provider_sku?: string | null;
}

interface CrossReference {
  id: number;
  product_sku: string;
  reference_product_sku: string;
  reference_brand?: string;
  reference_sku?: string;
  provider_sku?: string;
  created_at: string;
  reference_product?: {
    SKU: string;
    name: string;
    brand?: string;
    price: number;
    image?: string;
  };
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

interface CompatibilityItem {
  id: number;
  sku: string;
  assembly_plant_id: string;
  assembly_plant: string;
  model_id: string;
  model: string;
  year_id: string;
  year: string;
  motorization_id: string;
  motorization: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sku = params.sku as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [compatibilities, setCompatibilities] = useState<CompatibilityItem[]>([]);
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCompatibilities, setIsLoadingCompatibilities] = useState(false);
  const [isLoadingCrossRefs, setIsLoadingCrossRefs] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Estados para paginación de compatibilidades
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCompatibilities, setTotalCompatibilities] = useState(0);
  
  // Estados para modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCrossRefModalOpen, setIsCrossRefModalOpen] = useState(false);
  
  // Estados para provider_sku editable
  const [isEditingProviderSKU, setIsEditingProviderSKU] = useState(false);
  const [providerSKUValue, setProviderSKUValue] = useState<string>('');
  const [isSavingProviderSKU, setIsSavingProviderSKU] = useState(false);

  const loadProductData = useCallback(async () => {
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
      const inventory: InventoryItem[] = inventoryData?.map((item: {
        id: number;
        provider_branch_id: number;
        stock: number;
        reserved_stock: number;
        updated_at: string;
        provider_branches?: {
          branch_name?: string;
          city?: string;
          provider?: { name?: string };
        };
      }) => ({
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
      setProviderSKUValue(productData.provider_sku || '');

    } catch (err) {
      setError('Error al cargar los detalles del producto');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sku]);

  const loadCompatibilities = useCallback(async (page: number = 1) => {
    if (!sku) return;
    
    setIsLoadingCompatibilities(true);
    
    try {
      // Calcular offset para paginación
      const offset = (page - 1) * itemsPerPage;
      
      // Cargar compatibilidades con paginación
      const { data: compatibilitiesData, error: compatibilitiesError, count } = await supabase
        .from('compatibilities_test')
        .select('*', { count: 'exact' })
        .eq('sku', sku)
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (compatibilitiesError) {
        console.error('Error loading compatibilities:', compatibilitiesError);
        throw compatibilitiesError;
      }

      // Transformar datos de compatibilidades
      const compatibilities: CompatibilityItem[] = (compatibilitiesData || []).map((item: Record<string, string | number>) => ({
        id: item.id as number,
        sku: item.sku as string,
        assembly_plant_id: (item.assembly_plant_id as string) || '',
        assembly_plant: (item.assembly_plant as string) || '',
        model_id: (item.model_id as string) || '',
        model: (item.model as string) || '',
        year_id: (item.year_id as string) || '',
        year: (item.year as string) || '',
        motorization_id: (item.motorization_id as string) || '',
        motorization: (item.motorization as string) || '',
        created_at: item.created_at as string
      }));

      setCompatibilities(compatibilities);
      setTotalCompatibilities(count || 0);
      setCurrentPage(page);
      

    } catch (err) {
      console.error('Error loading compatibilities:', err);
      setCompatibilities([]);
      setTotalCompatibilities(0);
    } finally {
      setIsLoadingCompatibilities(false);
    }
  }, [sku, itemsPerPage]);

  const loadCrossReferences = useCallback(async () => {
    if (!sku) return;
    
    setIsLoadingCrossRefs(true);
    
    try {
      // Cargar cross references
      const { data: crossRefsData, error: crossRefsError } = await supabase
        .from('product_cross_references')
        .select('*')
        .eq('product_sku', sku);

      if (crossRefsError) {
        console.error('Error loading cross references:', crossRefsError);
        throw crossRefsError;
      }

      // Si hay cross references, cargar la información de los productos referenciados
      if (crossRefsData && crossRefsData.length > 0) {
        const referenceSKUs = crossRefsData.map(ref => ref.reference_product_sku);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products_test')
          .select('SKU, name, brand, price, image')
          .in('SKU', referenceSKUs);

        if (productsError) {
          console.error('Error loading reference products:', productsError);
        }

        // Combinar los datos
        const enrichedCrossRefs = crossRefsData.map(crossRef => ({
          ...crossRef,
          reference_product: productsData?.find(p => p.SKU === crossRef.reference_product_sku)
        }));

        setCrossReferences(enrichedCrossRefs);
        console.log('Cross references cargadas:', enrichedCrossRefs.length);
      } else {
        setCrossReferences([]);
      }

    } catch (err) {
      console.error('Error loading cross references:', err);
      setCrossReferences([]);
    } finally {
      setIsLoadingCrossRefs(false);
    }
  }, [sku]);

  useEffect(() => {
    if (sku) {
      loadProductData();
      loadCompatibilities(1);
      loadCrossReferences();
    }
  }, [sku, loadProductData, loadCompatibilities, loadCrossReferences]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      // Actualizar producto en Supabase
      const { error: updateError } = await supabase
        .from('products_test')
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          image: updatedProduct.image,
          category: updatedProduct.category,
          brand: updatedProduct.brand,
          brand_code: updatedProduct.brand_code,
          provider: updatedProduct.provider,
          provider_id: updatedProduct.provider_id
        })
        .eq('SKU', updatedProduct.SKU);

      if (updateError) {
        console.error('Error updating product:', updateError);
        throw new Error('Error al actualizar el producto');
      }

      // Recargar datos del producto
      await loadProductData();
      setIsEditModalOpen(false);
      
      // Mostrar mensaje de éxito (opcional)
      alert('Producto actualizado exitosamente');
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error al actualizar el producto');
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!product) return;
    
    setIsDeleting(true);
    try {
      // Eliminar producto de Supabase
      const { error: deleteError } = await supabase
        .from('products_test')
        .delete()
        .eq('SKU', product.SKU);

      if (deleteError) {
        console.error('Error deleting product:', deleteError);
        throw new Error('Error al eliminar el producto');
      }

      // Redirigir al listado de productos
      router.push('/dashboard/products/listing');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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

  // Función para guardar provider_sku
  const handleSaveProviderSKU = async () => {
    if (!product) return;
    
    setIsSavingProviderSKU(true);
    try {
      // Convertir el valor a string o null
      const value = providerSKUValue.trim() === '' ? null : providerSKUValue.trim();

      const { error } = await supabase
        .from('products_test').update({ provider_sku: value }).eq('SKU', product.SKU);

      if (error) {
        console.error('Error updating provider_sku:', error);
        throw new Error('Error al actualizar el SKU del proveedor');
      }

      // Actualizar el producto local
      setProduct({ ...product, provider_sku: value });
      setIsEditingProviderSKU(false);
      alert('SKU del proveedor actualizado exitosamente');
    } catch (err) {
      console.error('Error saving provider_sku:', err);
      alert('Error al guardar el SKU del proveedor');
    } finally {
      setIsSavingProviderSKU(false);
    }
  };

  // Función para manejar la confirmación de cross references
  const handleConfirmCrossReferences = async (selectedProducts: Product[]) => {
    if (!product) return;
    
    try {
      // Crear las cross references
      const crossRefs = selectedProducts.map(selectedProduct => ({
        product_sku: product.SKU,
        reference_product_sku: selectedProduct.SKU,
        reference_brand: selectedProduct.brand,
        reference_sku: selectedProduct.SKU,
        product_brand: product.brand
      }));

      const { error } = await supabase
        .from('product_cross_references')
        .insert(crossRefs);

      if (error) {
        console.error('Error creating cross references:', error);
        throw new Error('Error al crear las referencias cruzadas');
      }

      // Recargar cross references
      await loadCrossReferences();
      alert(`${selectedProducts.length} referencia(s) cruzada(s) agregada(s) exitosamente`);
    } catch (err) {
      console.error('Error creating cross references:', err);
      alert('Error al crear las referencias cruzadas');
    }
  };

  // Función para eliminar una cross reference
  const handleDeleteCrossReference = async (crossRefId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta referencia cruzada?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product_cross_references')
        .delete()
        .eq('id', crossRefId);

      if (error) {
        console.error('Error deleting cross reference:', error);
        throw new Error('Error al eliminar la referencia cruzada');
      }

      // Recargar cross references
      await loadCrossReferences();
      alert('Referencia cruzada eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting cross reference:', err);
      alert('Error al eliminar la referencia cruzada');
    }
  };

  // Funciones para paginación de compatibilidades
  const handlePageChange = (page: number) => {
    loadCompatibilities(page);
  };

  const getTotalPages = () => {
    return Math.ceil(totalCompatibilities / itemsPerPage);
  };

  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
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
            onClick={() => router.push('/dashboard/products/listing')}
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
      {/* Modal de Edición */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProduct}
        product={product as Product}
      />

      {/* Modal de Cross References */}
      <AddCrossReferenceModal
        isOpen={isCrossRefModalOpen}
        onClose={() => setIsCrossRefModalOpen(false)}
        onConfirm={handleConfirmCrossReferences}
        currentProductSKU={product.SKU}
      />

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el producto <strong>{product?.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard/products/listing')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600">SKU: {product.SKU}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">SKU Proveedor:</span>
                  {isEditingProviderSKU ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={providerSKUValue}
                        onChange={(e) => setProviderSKUValue(e.target.value)}
                        placeholder="SKU del proveedor"
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSaveProviderSKU}
                        disabled={isSavingProviderSKU}
                        className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSavingProviderSKU ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProviderSKU(false);
                          setProviderSKUValue(product.provider_sku || '');
                        }}
                        className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {product.provider_sku ? (
                        <span className="text-sm font-mono font-medium text-gray-900">{product.provider_sku}</span>
                      ) : (
                        <span className="text-sm text-amber-600 font-medium">⚠️ No asignado</span>
                      )}
                      <button
                        onClick={() => setIsEditingProviderSKU(true)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Editar SKU del proveedor"
                      >
                        <Edit className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

            {/* Compatibilities Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Compatibilidades Vehiculares</h3>
                <div className="text-sm text-gray-500">
                  Total: {totalCompatibilities} compatibilidades
                </div>
              </div>

              {isLoadingCompatibilities ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando compatibilidades...</span>
                </div>
              ) : compatibilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay compatibilidades registradas para este producto</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tabla de compatibilidades */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Planta de Ensamble
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modelo
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Año
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Motorización
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {compatibilities.map((compatibility) => (
                          <tr key={compatibility.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {compatibility.assembly_plant || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {compatibility.model || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {compatibility.year || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {compatibility.motorization || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {getTotalPages() > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === getTotalPages()}
                          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Mostrando{' '}
                            <span className="font-medium">
                              {Math.min((currentPage - 1) * itemsPerPage + 1, totalCompatibilities)}
                            </span>{' '}
                            a{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, totalCompatibilities)}
                            </span>{' '}
                            de{' '}
                            <span className="font-medium">{totalCompatibilities}</span>{' '}
                            resultados
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Anterior</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                              </svg>
                            </button>
                            
                            {getPageNumbers().map((page, index) => (
                              <button
                                key={index}
                                onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                                disabled={page === '...'}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  page === currentPage
                                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                    : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === getTotalPages()}
                              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Siguiente</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cross References Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Referencias Cruzadas</h3>
                </div>
                <button
                  onClick={() => setIsCrossRefModalOpen(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Asignar Cross Reference
                </button>
              </div>

              {isLoadingCrossRefs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando referencias...</span>
                </div>
              ) : crossReferences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay referencias cruzadas asignadas</p>
                  <p className="text-sm mt-2">Haz clic en &quot;Asignar Cross Reference&quot; para agregar productos relacionados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crossReferences.map((crossRef) => (
                    <div key={crossRef.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {/* Product Image */}
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {crossRef.reference_product?.image ? (
                              <Image
                                src={crossRef.reference_product.image}
                                alt={crossRef.reference_product.name || 'Producto'}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Sin+Imagen';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {crossRef.reference_product?.name || 'Producto sin nombre'}
                            </h4>
                            <div className="mt-1 space-y-1">
                              <p className="text-xs text-gray-500 font-mono">
                                SKU: {crossRef.reference_product_sku}
                              </p>
                              {crossRef.reference_brand && (
                                <p className="text-xs text-gray-600">
                                  Marca: {crossRef.reference_brand}
                                </p>
                              )}
                              {crossRef.reference_product?.price && (
                                <p className="text-sm font-semibold text-green-600">
                                  ${crossRef.reference_product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <button
                                onClick={() => router.push(`/dashboard/products/${crossRef.reference_product_sku}`)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Ver producto
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCrossReference(crossRef.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar referencia cruzada"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Agregado: {new Date(crossRef.created_at).toLocaleDateString('es-MX', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
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
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
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

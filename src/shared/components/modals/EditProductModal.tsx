'use client';
import { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Product } from '@/core/products/interface/Product';
import { brandAutoParts } from '@/app/dashboard/products/helpers/brands';
import { categories } from '@/app/dashboard/products/helpers/categories';
import { Package, AlertCircle, Save } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Product) => Promise<void>;
  product: Product | null;
}

interface FormData {
  name: string;
  SKU: string;
  price: string;
  category: string;
  brand: string;
  brand_code: string;
  description: string;
  provider: string;
  provider_id: string;
  image: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditProductModal({ isOpen, onClose, onSubmit, product }: EditProductModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    SKU: '',
    price: '',
    category: '',
    brand: '',
    brand_code: '',
    description: '',
    provider: '',
    provider_id: '',
    image: ''
  });

  // Initialize form with product data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        SKU: product.SKU || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        brand: product.brand || '',
        brand_code: product.brand_code || '',
        description: product.description || '',
        provider: product.provider || '',
        provider_id: product.provider_id?.toString() || '',
        image: product.image || ''
      });
    }
  }, [product]);

  // Filter brands based on selected category
  const availableBrands = useMemo(() => {
    if (!formData.category) return [];
    return brandAutoParts.filter(brand => 
      brand.categoryCodes.includes(formData.category)
    );
  }, [formData.category]);

  // Auto-set brand code when brand is selected
  const handleBrandChange = (brandName: string) => {
    const selectedBrand = brandAutoParts.find(brand => brand.name === brandName);
    setFormData(prev => ({
      ...prev,
      brand: brandName,
      brand_code: selectedBrand ? selectedBrand.brand_id : ''
    }));
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.SKU.trim()) {
      newErrors.SKU = 'El SKU es requerido';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'El precio debe ser un número mayor a 0';
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const productData: Product = {
        SKU: formData.SKU.trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        brand_code: formData.brand_code.trim() || undefined,
        description: formData.description.trim() || undefined,
        provider: formData.provider.trim() || undefined,
        provider_id: formData.provider_id ? parseInt(formData.provider_id) : undefined,
        image: formData.image.trim() || undefined
      };

      await onSubmit(productData);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ submit: 'Error al actualizar el producto. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!product) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Producto" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{errors.submit}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Información Básica</h4>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Ej: Kit Amortiguadores Delanteros"
                disabled={isSubmitting}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="SKU" className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                id="SKU"
                value={formData.SKU}
                onChange={(e) => handleInputChange('SKU', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.SKU ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Ej: KIT-AMOR-001"
                disabled={isSubmitting}
              />
              {errors.SKU && <p className="mt-1 text-sm text-red-600">{errors.SKU}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => {
                  handleInputChange('category', e.target.value);
                  handleInputChange('brand', ''); // Reset brand when category changes
                  handleInputChange('brand_code', '');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.Codigo} value={category.Codigo}>
                    {category.Nombre}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Información Adicional</h4>
            
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting || !formData.category}
              >
                <option value="">Seleccionar marca</option>
                {availableBrands.map((brand) => (
                  <option key={brand.name} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {!formData.category ? (
                <p className="mt-1 text-sm text-gray-500">Selecciona una categoría primero</p>
              ) : availableBrands.length === 0 ? (
                <p className="mt-1 text-sm text-orange-600">No hay marcas disponibles para esta categoría</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <input
                type="text"
                id="provider"
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: GOVI REFACCIONARIA SA DE CV"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="provider_id" className="block text-sm font-medium text-gray-700 mb-1">
                ID del Proveedor
              </label>
              <input
                type="number"
                id="provider_id"
                min="1"
                value={formData.provider_id}
                onChange={(e) => handleInputChange('provider_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <div className="flex">
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  <Package className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (HTML)
            </label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={`<div class="producto">
    <h1>Título del producto</h1>
    <p>Descripción detallada del producto...</p>
    <h2>Compatibilidades:</h2>
    <ul>
        <li><strong>Posición:</strong> Información</li>
    </ul>
</div>`}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">Puedes usar HTML para formatear la descripción</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

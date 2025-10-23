'use client';
import { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Product } from '@/core/products/application/use-cases/useProducts';
import { brandAutoParts } from '@/app/products/helpers/brands';
import { categories } from '@/app/products/helpers/categories';
import { Package, Upload, AlertCircle } from 'lucide-react';
import supabase from '@/lib/Supabase';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'SKU'> & { SKU?: string }) => Promise<void>;
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
  provider_branch_id: string;
  initial_stock: string;
}

interface FormErrors {
  [key: string]: string;
}


export default function CreateProductModal({ isOpen, onClose, onSubmit }: CreateProductModalProps) {
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
    image: '',
    provider_branch_id: '',
    initial_stock: '0'
  });

  const [isHtmlMode, setIsHtmlMode] = useState(true);
  const [providers, setProviders] = useState<Array<{id: number, name: string}>>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providerBranches, setProviderBranches] = useState<Array<{id: number, branch_name: string, city: string}>>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Load providers when modal opens
  useEffect(() => {
    if (isOpen && providers.length === 0) {
      loadProviders();
    }
  }, [isOpen]);

  // Load providers from Supabase
  const loadProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const { data: providersData, error } = await supabase
        .from('provider')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading providers:', error);
        return;
      }

      setProviders(providersData || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  // Convert between HTML and plain text when mode changes
  const handleModeToggle = () => {
    const newMode = !isHtmlMode;
    
    if (formData.description) {
      if (newMode) {
        // Converting to HTML mode - wrap plain text in basic HTML structure
        const plainText = formData.description;
        const htmlDescription = `<div class="producto">
    <h1>Título del producto</h1>
    <p>${plainText.replace(/\n/g, '</p>\n    <p>')}</p>
</div>`;
        setFormData(prev => ({ ...prev, description: htmlDescription }));
      } else {
        // Converting to plain text mode - strip HTML tags
        const htmlDescription = formData.description;
        const plainText = htmlDescription
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
        setFormData(prev => ({ ...prev, description: plainText }));
      }
    }
    
    setIsHtmlMode(newMode);
  };

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

  // Load provider branches from Supabase
  const loadProviderBranches = async (providerId: number) => {
    setIsLoadingBranches(true);
    try {
      const { data: branchesData, error } = await supabase
        .from('provider_branches')
        .select('id, branch_name, city')
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .order('branch_name');

      if (error) {
        console.error('Error loading provider branches:', error);
        return;
      }

      setProviderBranches(branchesData || []);
    } catch (error) {
      console.error('Error loading provider branches:', error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Auto-set provider_id when provider is selected
  const handleProviderChange = (providerId: string) => {
    const selectedProvider = providers.find(provider => provider.id === Number(providerId));
    setFormData(prev => ({
      ...prev,
      provider: selectedProvider?.name || '',
      provider_id: providerId,
      provider_branch_id: '' // Reset branch selection when provider changes
    }));

    // Load branches for selected provider
    if (providerId) {
      loadProviderBranches(Number(providerId));
    } else {
      setProviderBranches([]);
    }
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
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número válido mayor a 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const productData: Omit<Product, 'SKU'> & { SKU?: string } = {
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category,
        brand: formData.brand.trim() || undefined,
        brand_code: formData.brand_code.trim() || undefined,
        description: formData.description.trim() || undefined,
        provider: formData.provider.trim() || undefined,
        provider_id: formData.provider_id ? Number(formData.provider_id) : undefined,
        image: formData.image.trim() || undefined,
        SKU: formData.SKU.trim()
      };

      await onSubmit(productData);

      // Create initial inventory if branch and stock are specified
      if (formData.provider_branch_id && Number(formData.initial_stock) > 0) {
        try {
          const { error: inventoryError } = await supabase
            .from('inventory')
            .insert({
              product_sku: formData.SKU.trim(),
              provider_branch_id: Number(formData.provider_branch_id),
              stock: Number(formData.initial_stock),
              reserved_stock: 0
            });

          if (inventoryError) {
            console.error('Error creating initial inventory:', inventoryError);
            // Don't fail the whole operation, just log the error
          }
        } catch (inventoryErr) {
          console.error('Error creating initial inventory:', inventoryErr);
        }
      }
      
      // Reset form
      setFormData({
        name: '',
        SKU: '',
        price: '',
        category: '',
        brand: '',
        brand_code: '',
        description: '',
        provider: '',
        provider_id: '',
        image: '',
        provider_branch_id: '',
        initial_stock: '0'
      });
      setErrors({});
      setIsHtmlMode(true);
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ submit: 'Error al crear el producto. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        SKU: '',
        price: '',
        category: '',
        brand: '',
        brand_code: '',
        description: '',
        provider: '',
        provider_id: '',
        image: '',
        provider_branch_id: '',
        initial_stock: '0'
      });
      setErrors({});
      setIsHtmlMode(true);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nuevo Producto" maxWidth="2xl">
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
                placeholder="Ej: iPhone 15 Pro Max"
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
                placeholder="Ej: IPH15PM-256-BLK"
                disabled={isSubmitting}
              />
              {errors.SKU && <p className="mt-1 text-sm text-red-600">{errors.SKU}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
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
                  // Reset brand when category changes
                  handleInputChange('brand', '');
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
              <label htmlFor="provider_id" className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                id="provider_id"
                value={formData.provider_id}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting || isLoadingProviders}
              >
                <option value="">
                  {isLoadingProviders ? 'Cargando proveedores...' : 'Selecciona un proveedor'}
                </option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              {formData.provider_id && (
                <p className="mt-1 text-xs text-gray-500">
                  ID: {formData.provider_id} | Nombre: {formData.provider}
                </p>
              )}
            </div>

            {/* Sucursal del Proveedor */}
            <div>
              <label htmlFor="provider_branch_id" className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal del Proveedor
              </label>
              <select
                id="provider_branch_id"
                value={formData.provider_branch_id}
                onChange={(e) => handleInputChange('provider_branch_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting || isLoadingBranches || !formData.provider_id}
              >
                <option value="">
                  {!formData.provider_id 
                    ? 'Selecciona un proveedor primero'
                    : isLoadingBranches 
                    ? 'Cargando sucursales...' 
                    : 'Selecciona una sucursal'
                  }
                </option>
                {providerBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name} - {branch.city}
                  </option>
                ))}
              </select>
              {!formData.provider_id && (
                <p className="mt-1 text-xs text-gray-500">
                  Primero selecciona un proveedor para ver sus sucursales
                </p>
              )}
            </div>

            {/* Stock Inicial */}
            <div>
              <label htmlFor="initial_stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Inicial
              </label>
              <input
                type="number"
                id="initial_stock"
                min="0"
                value={formData.initial_stock}
                onChange={(e) => handleInputChange('initial_stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Cantidad inicial de productos en inventario para esta sucursal
              </p>
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
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción {isHtmlMode ? '(HTML)' : '(Texto Plano)'}
            </label>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${!isHtmlMode ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Texto
              </span>
              <button
                type="button"
                onClick={handleModeToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isHtmlMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    isHtmlMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-xs ${isHtmlMode ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                HTML
              </span>
            </div>
          </div>
          <textarea
            id="description"
            rows={6}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              isHtmlMode ? 'font-mono' : 'font-sans'
            }`}
            placeholder={isHtmlMode ? `<div class="producto">
    <h1>Título del producto</h1>
    <p>Descripción detallada del producto...</p>
    <h2>Compatibilidades:</h2>
    <ul>
        <li><strong>Posición:</strong> Información</li>
    </ul>
</div>` : `Descripción detallada del producto...

Compatibilidades:
- Posición: Información
- Marca: Información
- Modelo: Información`}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            {isHtmlMode 
              ? 'Puedes usar HTML para formatear la descripción con etiquetas como <h1>, <p>, <ul>, etc.'
              : 'Descripción en texto plano. El formato se aplicará automáticamente.'
            }
          </p>
        </div>

        {/* Preview */}
        {(formData.name || formData.image) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa</h4>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt={formData.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Package className={`h-6 w-6 text-gray-400 ${formData.image ? 'hidden' : ''}`} />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {formData.name || 'Nombre del producto'}
                </div>
                <div className="text-sm text-gray-500">
                  SKU: {formData.SKU || 'N/A'} | ${formData.price || '0.00'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Crear Producto
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

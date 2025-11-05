'use client';
import { useState, useCallback, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { useProducts } from '@/core/products/application/useProducts';
import { Product } from '@/core/products/interface/Product';
import Image from 'next/image';
import supabase from '@/lib/Supabase';

interface AddCrossReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: Product[]) => void;
  currentProductSKU: string;
}

export default function AddCrossReferenceModal({
  isOpen,
  onClose,
  onConfirm,
  currentProductSKU
}: AddCrossReferenceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [assemblyPlantFilter, setAssemblyPlantFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [motorizationFilter, setMotorizationFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Estados para los datos de filtros
  interface AssemblyPlant {
    code: string;
    assembly_plant: string;
  }
  
  interface Model {
    id: number;
    model_car: string;
    code_assembly_plant: string;
  }
  
  interface Motorization {
    code: string;
    motorization: string;
  }
  
  const [brands, setBrands] = useState<string[]>([]);
  const [assemblyPlants, setAssemblyPlants] = useState<AssemblyPlant[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [motorizations, setMotorizations] = useState<Motorization[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const {
    paginatedProducts,
    loading,
    filterProducts,
    currentPage,
    totalPages,
    handlePageChange,
    totalItems
  } = useProducts();

  // Cargar datos de filtros
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        // Cargar marcas únicas
        const { data: brandsData } = await supabase
          .from('products_test')
          .select('brand')
          .not('brand', 'is', null);
        const uniqueBrands = [...new Set(brandsData?.map(p => p.brand).filter(Boolean))];
        setBrands(uniqueBrands as string[]);

        // Cargar ensambladoras
        const { data: plantsData } = await supabase
          .from('assembly_plant_test')
          .select('*');
        setAssemblyPlants(plantsData || []);

        // Cargar años
        const { data: yearsData } = await supabase
          .from('year_car_test')
          .select('year')
          .order('year', { ascending: false });
        setYears(yearsData?.map(y => y.year) || []);

        // Cargar motorizaciones
        const { data: motorizationsData } = await supabase
          .from('motorization_car_test')
          .select('*');
        setMotorizations(motorizationsData || []);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    if (isOpen) {
      loadFilterData();
    }
  }, [isOpen]);

  // Cargar modelos cuando cambia la ensambladora
  useEffect(() => {
    const loadModels = async () => {
      if (!assemblyPlantFilter) {
        setModels([]);
        return;
      }

      try {
        const selectedPlant = assemblyPlants.find(p => p.assembly_plant === assemblyPlantFilter);
        if (selectedPlant) {
          const { data: modelsData } = await supabase
            .from('model_car_test')
            .select('*')
            .eq('code_assembly_plant', selectedPlant.code);
          setModels(modelsData || []);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, [assemblyPlantFilter, assemblyPlants]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply filters when debounced search or catalog filters change
  useEffect(() => {
    const filters: Record<string, string> = {};
    
    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch;
    }
    if (brandFilter) {
      filters.brand = brandFilter;
    }
    if (assemblyPlantFilter) {
      filters.assembly_plant = assemblyPlantFilter;
    }
    if (modelFilter) {
      filters.model = modelFilter;
    }
    if (motorizationFilter) {
      filters.motorization = motorizationFilter;
    }
    
    filterProducts(filters);
  }, [debouncedSearch, brandFilter, assemblyPlantFilter, modelFilter, motorizationFilter, filterProducts]);

  const handleProductToggle = useCallback((product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.SKU === product.SKU);
      if (isSelected) {
        return prev.filter(p => p.SKU !== product.SKU);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const isProductSelected = useCallback((sku: string) => {
    return selectedProducts.some(p => p.SKU === sku);
  }, [selectedProducts]);

  const handleConfirm = () => {
    onConfirm(selectedProducts);
    setSelectedProducts([]);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asignar Cross References</h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona los productos que deseas vincular como referencias cruzadas
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos por nombre, SKU o marca..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Marca */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las marcas</option>
                {brands.map((brand: string) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Ensambladora */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ensambladora</label>
              <select
                value={assemblyPlantFilter}
                onChange={(e) => {
                  setAssemblyPlantFilter(e.target.value);
                  setModelFilter(''); // Reset model when assembly plant changes
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {assemblyPlants.map((plant) => (
                  <option key={plant.code} value={plant.assembly_plant || ''}>
                    {plant.assembly_plant}
                  </option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                disabled={!assemblyPlantFilter}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Todos</option>
                {models.map((model) => (
                  <option key={model.id} value={model.model_car || ''}>
                    {model.model_car}
                  </option>
                ))}
              </select>
            </div>

            {/* Motorización */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Motorización</label>
              <select
                value={motorizationFilter}
                onChange={(e) => setMotorizationFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {motorizations.map((motorization) => (
                  <option key={motorization.code} value={motorization.motorization || ''}>
                    {motorization.motorization}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Año</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {years.map((year: string) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Selected Count */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando productos...</span>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts
                .filter(product => product.SKU !== currentProductSKU)
                .map((product) => {
                  const isSelected = isProductSelected(product.SKU);
                  return (
                    <div
                      key={product.SKU}
                      onClick={() => handleProductToggle(product)}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {/* Selection Indicator - Con z-index alto */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 z-10 shadow-lg">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {/* Product Image - Con object-contain para ver imagen completa */}
                      <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Sin+Imagen';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Sin imagen</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono">SKU: {product.SKU}</p>
                        {product.brand && (
                          <p className="text-xs text-gray-600">Marca: {product.brand}</p>
                        )}
                        <p className="text-lg font-bold text-green-600">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {Math.min((currentPage - 1) * 20 + 1, totalItems)} -{' '}
                {Math.min(currentPage * 20, totalItems)} de {totalItems} productos
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedProducts.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar ({selectedProducts.length})
          </button>
        </div>
      </div>
    </div>
  );
}

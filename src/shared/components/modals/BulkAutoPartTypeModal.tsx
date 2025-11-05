'use client';
import { useState, useCallback, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Search, Tag, AlertCircle, CheckCircle, X } from 'lucide-react';
import supabase from '@/lib/Supabase';

interface BulkAutoPartTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface AutoPartType {
  code: string;
  name: string;
}

interface Product {
  SKU: string;
  name: string;
  brand?: string;
  category?: string;
  auto_part_type_code?: string;
}

export default function BulkAutoPartTypeModal({ isOpen, onClose, onUpdate }: BulkAutoPartTypeModalProps) {
  const [autoPartTypes, setAutoPartTypes] = useState<AutoPartType[]>([]);
  const [selectedAutoPartType, setSelectedAutoPartType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Load auto part types from catalog
  useEffect(() => {
    if (isOpen) {
      loadAutoPartTypes();
    }
  }, [isOpen]);

  const loadAutoPartTypes = async () => {
    setLoadingTypes(true);
    try {
      const { data, error } = await supabase
        .from('auto_part_catalog')
        .select('code, name')
        .order('code');

      if (error) throw error;

      setAutoPartTypes(data || []);
    } catch (err) {
      console.error('Error loading auto part types:', err);
      setError('Error al cargar el catálogo de tipos de autopartes');
    } finally {
      setLoadingTypes(false);
    }
  };

  // Search products
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Ingresa un término de búsqueda');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const { data, error } = await supabase
        .from('products_test')
        .select('SKU, name, brand, category, auto_part_type_code')
        .or(`SKU.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(50);

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        setError('No se encontraron productos con ese criterio de búsqueda');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Error al buscar productos');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Handle Enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Toggle product selection
  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.SKU === product.SKU);
      if (isSelected) {
        return prev.filter(p => p.SKU !== product.SKU);
      } else {
        return [...prev, product];
      }
    });
  };

  // Select all search results
  const selectAllResults = () => {
    setSelectedProducts(searchResults);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedProducts([]);
  };

  // Remove product from selection
  const removeFromSelection = (sku: string) => {
    setSelectedProducts(prev => prev.filter(p => p.SKU !== sku));
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) {
      setError('Selecciona al menos un producto');
      return;
    }

    if (!selectedAutoPartType) {
      setError('Selecciona un tipo de autoparte');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      // Update products one by one to avoid CORS/RLS issues
      let updatedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      
      for (const product of selectedProducts) {
        try {
          // Use RPC function to avoid CORS issues with UPDATE operations
          const { data, error } = await supabase
            .rpc('update_product_auto_part_type', {
              p_sku: product.SKU,
              p_auto_part_type_code: selectedAutoPartType
            });

          if (error) {
            console.error(`Error updating ${product.SKU}:`, error);
            errors.push(`${product.SKU}: ${error.message}`);
            failedCount++;
          } else if (data && !data.success) {
            console.error(`Failed to update ${product.SKU}:`, data.message);
            errors.push(`${product.SKU}: ${data.message}`);
            failedCount++;
          } else {
            updatedCount++;
          }
        } catch (err) {
          console.error(`Exception updating ${product.SKU}:`, err);
          errors.push(`${product.SKU}: Error desconocido`);
          failedCount++;
        }
      }

      if (failedCount > 0) {
        setError(`Se actualizaron ${updatedCount} productos. ${failedCount} fallaron: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
        // Don't close automatically if there were errors
        if (updatedCount > 0) {
          onUpdate(); // Refresh the list for successful updates
        }
      } else {
        setSuccessMessage(`✅ Se actualizaron ${updatedCount} productos correctamente`);
        
        // Clear selections after 2 seconds and close only if all succeeded
        setTimeout(() => {
          setSelectedProducts([]);
          setSearchResults([]);
          setSearchQuery('');
          setSelectedAutoPartType('');
          setSuccessMessage('');
          onUpdate();
          onClose();
        }, 2000);
      }

    } catch (err) {
      console.error('Error updating products:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar los productos');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedProducts([]);
      setSelectedAutoPartType('');
      setError('');
      setSuccessMessage('');
      onClose();
    }
  };

  const selectedTypeInfo = autoPartTypes.find(t => t.code === selectedAutoPartType);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Asignar Tipo de Pieza Masivamente" maxWidth="2xl">
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Search & Select Products */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">1. Buscar Productos</h3>
              
              {/* Search Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Buscar por SKU, nombre, marca o categoría..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSearching}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">
                    {searchResults.length} resultado(s) encontrado(s)
                  </p>
                  <button
                    onClick={selectAllResults}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Seleccionar todos
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {searchResults.map((product) => {
                    const isSelected = selectedProducts.some(p => p.SKU === product.SKU);
                    return (
                      <div
                        key={product.SKU}
                        onClick={() => toggleProductSelection(product)}
                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {product.SKU}</p>
                            {product.brand && (
                              <p className="text-xs text-gray-500">Marca: {product.brand}</p>
                            )}
                            {product.auto_part_type_code && (
                              <p className="text-xs text-orange-600 mt-1">
                                Tipo actual: {product.auto_part_type_code}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Selected Products & Auto Part Type */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">2. Seleccionar Tipo de Autoparte</h3>
              
              {loadingTypes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <select
                  value={selectedAutoPartType}
                  onChange={(e) => setSelectedAutoPartType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un tipo...</option>
                  {autoPartTypes.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.code} - {type.name}
                    </option>
                  ))}
                </select>
              )}

              {selectedTypeInfo && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900">
                    {selectedTypeInfo.code} - {selectedTypeInfo.name}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Products List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  3. Productos Seleccionados ({selectedProducts.length})
                </h3>
                {selectedProducts.length > 0 && (
                  <button
                    onClick={clearAllSelections}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {selectedProducts.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No hay productos seleccionados
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Busca y selecciona productos de la lista
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.SKU}
                      className="p-3 border-b border-gray-100 flex items-start justify-between hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">SKU: {product.SKU}</p>
                      </div>
                      <button
                        onClick={() => removeFromSelection(product.SKU)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleBulkUpdate}
            disabled={isUpdating || selectedProducts.length === 0 || !selectedAutoPartType}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Actualizando...
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Asignar Tipo ({selectedProducts.length})
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

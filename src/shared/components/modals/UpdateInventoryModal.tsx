'use client';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import { Package, Plus, Trash2, AlertCircle, Save } from 'lucide-react';
import supabase from '@/lib/Supabase';

interface UpdateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (inventoryUpdates: InventoryEntry[]) => Promise<void>;
  product: any;
}

interface InventoryEntry {
  id?: number;
  product_sku: string;
  provider_branch_id: number;
  provider_branch_name?: string;
  stock: number;
  reserved_stock: number;
  isNew?: boolean;
}

interface ProviderBranch {
  id: number;
  provider_id: number;
  branch_name: string;
  city: string;
  provider_name: string;
}

export default function UpdateInventoryModal({ isOpen, onClose, onUpdate, product }: UpdateInventoryModalProps) {
  const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
  const [availableBranches, setAvailableBranches] = useState<ProviderBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Load existing inventory and available branches when modal opens
  useEffect(() => {
    if (isOpen && product) {
      loadInventoryData();
    }
  }, [isOpen, product]);

  const loadInventoryData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Load existing inventory for this product using real Supabase queries
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
        .eq('product_sku', product.SKU);

      if (inventoryError) {
        console.error('Error loading inventory:', inventoryError);
      }

      // Transform inventory data
      const inventoryEntries: InventoryEntry[] = inventoryData?.map((item: any) => ({
        id: item.id,
        product_sku: item.product_sku,
        provider_branch_id: item.provider_branch_id,
        provider_branch_name: item.provider_branches?.branch_name ? 
          `${item.provider_branches.branch_name} (${item.provider_branches.city})` : '',
        stock: item.stock || 0,
        reserved_stock: item.reserved_stock || 0
      })) || [];

      // Load provider branches using real Supabase query
      const { data: branchesData, error: branchesError } = await supabase
        .from('provider_branches')
        .select(`
          id,
          provider_id,
          branch_name,
          city,
          provider:provider_id(name)
        `)
        .eq('is_active', true)
        .order('provider_id')
        .order('branch_name');

      if (branchesError) {
        console.error('Error loading branches:', branchesError);
        throw new Error('Error al cargar sucursales de proveedores');
      }

      // Transform branches data
      const branches: ProviderBranch[] = branchesData?.map((branch: any) => ({
        id: branch.id,
        provider_id: branch.provider_id,
        branch_name: branch.branch_name,
        city: branch.city,
        provider_name: branch.provider?.name || 'Sin nombre'
      })) || [];

      setInventoryEntries(inventoryEntries);
      setAvailableBranches(branches);

    } catch (err) {
      setError('Error al cargar datos de inventario');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewEntry = () => {
    const newEntry: InventoryEntry = {
      product_sku: product.SKU,
      provider_branch_id: 0,
      stock: 0,
      reserved_stock: 0,
      isNew: true
    };
    setInventoryEntries(prev => [...prev, newEntry]);
  };

  const updateEntry = (index: number, field: keyof InventoryEntry, value: any) => {
    setInventoryEntries(prev => prev.map((entry, i) => {
      if (i === index) {
        const updated = { ...entry, [field]: value };
        
        // Update branch name when branch is selected
        if (field === 'provider_branch_id') {
          const branch = availableBranches.find(b => b.id === value);
          updated.provider_branch_name = branch ? `${branch.branch_name} (${branch.city})` : '';
        }
        
        return updated;
      }
      return entry;
    }));
  };

  const removeEntry = (index: number) => {
    setInventoryEntries(prev => prev.filter((_, i) => i !== index));
  };

  const validateEntries = (): boolean => {
    for (let i = 0; i < inventoryEntries.length; i++) {
      const entry = inventoryEntries[i];
      
      if (!entry.provider_branch_id || entry.provider_branch_id === 0) {
        setError(`Entrada ${i + 1}: Debe seleccionar una sucursal`);
        return false;
      }
      
      if (entry.stock < 0) {
        setError(`Entrada ${i + 1}: El stock no puede ser negativo`);
        return false;
      }
      
      if (entry.reserved_stock < 0) {
        setError(`Entrada ${i + 1}: El stock reservado no puede ser negativo`);
        return false;
      }
    }

    // Check for duplicate branches
    const branchIds = inventoryEntries.map(e => e.provider_branch_id);
    const uniqueBranchIds = new Set(branchIds);
    if (branchIds.length !== uniqueBranchIds.size) {
      setError('No puede haber entradas duplicadas para la misma sucursal');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateEntries()) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onUpdate(inventoryEntries);
      onClose();
    } catch (err) {
      setError('Error al actualizar inventario');
      console.error('Error updating inventory:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setInventoryEntries([]);
      setError('');
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Actualizar Inventario - ${product.name}`} maxWidth="2xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-500">SKU: {product.SKU} | Precio: ${product.price?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando inventario...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Inventario por Sucursal</h4>
              <button
                onClick={addNewEntry}
                disabled={isSaving}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Sucursal
              </button>
            </div>

            {inventoryEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay inventario registrado para este producto</p>
                <p className="text-sm">Haz clic en "Agregar Sucursal" para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryEntries.map((entry, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sucursal *
                        </label>
                        <select
                          value={entry.provider_branch_id}
                          onChange={(e) => updateEntry(index, 'provider_branch_id', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSaving}
                        >
                          <option value={0}>Seleccionar sucursal</option>
                          {availableBranches.map(branch => (
                            <option key={branch.id} value={branch.id}>
                              {branch.branch_name} - {branch.city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Disponible
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={entry.stock}
                          onChange={(e) => updateEntry(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSaving}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Reservado
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={entry.reserved_stock}
                          onChange={(e) => updateEntry(index, 'reserved_stock', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSaving}
                        />
                      </div>

                      <div>
                        <button
                          onClick={() => removeEntry(index)}
                          disabled={isSaving}
                          className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {entry.provider_branch_name && (
                      <div className="mt-2 text-sm text-gray-500">
                        Total disponible: {entry.stock - entry.reserved_stock} unidades
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || inventoryEntries.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Inventario
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

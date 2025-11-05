'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import supabase from '@/lib/Supabase';
import { useToast } from '@/shared/contexts/ToastContext';

interface BulkStockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    updates: StockUpdate[],
    onProgress?: (progress: { current: number; total: number; updated: number; created: number; skipped: number }) => void,
    signal?: AbortSignal
  ) => Promise<void>;
}

interface StockUpdate {
  provider_sku: string;
  provider_branch_id: number;
  stock: number;
  reserved_stock?: number;
}

interface ProcessedFile {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: string[];
  updates: StockUpdate[];
}

interface ProviderBranch {
  id: number;
  provider_id: number;
  branch_name: string;
  city: string;
  provider_name: string;
}

interface ProviderBranchData {
  id: number;
  provider_id: number;
  branch_name: string;
  city: string;
}

export default function BulkStockUpdateModal({ isOpen, onClose, onUpdate }: BulkStockUpdateModalProps) {
  const { addToast, updateToast, removeToast, registerAbortController, cancelOperation } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [providerBranchId, setProviderBranchId] = useState<number>(0);
  const [providerBranches, setProviderBranches] = useState<ProviderBranch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeToastIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (!providerBranchId) {
        setError('Por favor selecciona una sucursal de proveedor antes de cargar el archivo');
        return;
      }
      processFile(files[0]);
    }
  }, [providerBranchId]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!providerBranchId) {
        setError('Por favor selecciona una sucursal de proveedor antes de cargar el archivo');
        return;
      }
      processFile(files[0]);
    }
  }, [providerBranchId]);

  const loadProviderBranches = useCallback(async () => {
    setIsLoadingBranches(true);
    setError('');
    try {
      // Primero obtener las sucursales
      const { data: branchesData, error: branchesError } = await supabase
        .from('provider_branches')
        .select(`
          id,
          provider_id,
          branch_name,
          city
        `)
        .eq('is_active', true)
        .order('provider_id')
        .order('branch_name');

      if (branchesError) {
        console.error('Error loading branches:', branchesError);
        setError('Error al cargar sucursales de proveedores');
        setIsLoadingBranches(false);
        return;
      }

      if (!branchesData || branchesData.length === 0) {
        console.warn('No se encontraron sucursales activas');
        setProviderBranches([]);
        setIsLoadingBranches(false);
        return;
      }

      // Obtener los IDs únicos de proveedores
      const providerIds = [...new Set(branchesData.map(b => b.provider_id))];
      
      // Obtener los nombres de los proveedores
      const { data: providersData, error: providersError } = await supabase
        .from('provider')
        .select('id, name')
        .in('id', providerIds);

      if (providersError) {
        console.error('Error loading providers:', providersError);
        // Continuar sin nombres de proveedores
      }

      // Crear un mapa de proveedores para acceso rápido
      const providerMap = new Map<number, string>();
      providersData?.forEach((provider: { id: number; name: string }) => {
        providerMap.set(provider.id, provider.name);
      });

      // Mapear las sucursales con los nombres de proveedores
      const branches: ProviderBranch[] = branchesData.map((branch: ProviderBranchData) => ({
        id: branch.id,
        provider_id: branch.provider_id,
        branch_name: branch.branch_name,
        city: branch.city,
        provider_name: providerMap.get(branch.provider_id) || 'Sin nombre'
      }));

      console.log('✅ Sucursales cargadas:', branches.length);
      setProviderBranches(branches);
    } catch (err) {
      console.error('Error loading provider branches:', err);
      setError('Error al cargar sucursales de proveedores');
      setProviderBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  }, []);

  // Cargar sucursales de proveedores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (providerBranches.length === 0) {
        loadProviderBranches();
      }
    } else {
      // Reset providerBranchId cuando se cierra el modal
      setProviderBranchId(0);
      setProcessedFile(null);
      setError('');
    }
  }, [isOpen, providerBranches.length, loadProviderBranches]);

  // Cleanup: Solo marcar como desmontado, NO cancelar operaciones ni remover toast
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // NO cancelar la operación - debe continuar ejecutándose
      // NO remover el toast - debe persistir para que el usuario lo vea
      // Solo marcamos como desmontado para evitar actualizaciones de estado
    };
  }, []);

  const processFile = async (file: File) => {
    // Validar que se haya seleccionado una sucursal
    if (!providerBranchId || providerBranchId <= 0) {
      setError('Por favor selecciona una sucursal de proveedor antes de cargar el archivo');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProcessedFile(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls';
      
      let rows: string[][] = [];

      if (isExcel) {
        // Leer archivo Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a JSON con formato de array de arrays
        rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as string[][];
      } else {
        // Leer archivo CSV o texto plano
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        rows = lines.map(line => {
          // Dividir por comas, punto y coma o tabs, respetando comillas
          const columns = line.split(/[,;\t]/).map(col => col.trim().replace(/^["']|["']$/g, ''));
          return columns;
        });
      }
      
      if (rows.length === 0) {
        throw new Error('El archivo está vacío');
      }

      const updates: StockUpdate[] = [];
      const errors: string[] = [];
      let validRows = 0;

      // Detectar si la primera fila es un encabezado
      const firstRow = rows[0];
      const startIndex = firstRow.some(cell => 
        cell.toString().toLowerCase().includes('provider_sku') || 
        cell.toString().toLowerCase().includes('product_sku') || 
        cell.toString().toLowerCase().includes('stock')
      ) ? 1 : 0;

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        
        // Filtrar filas vacías
        if (!row || row.length === 0 || row.every(cell => !cell || cell.toString().trim() === '')) {
          continue;
        }

        // Asegurar que hay al menos 2 columnas (provider_sku y stock)
        if (row.length < 2) {
          errors.push(`Línea ${i + 1}: Formato incorrecto (se esperan al menos 2 columnas: provider_sku, stock)`);
          continue;
        }

        // Validar que se haya seleccionado una sucursal
        if (!providerBranchId || providerBranchId <= 0) {
          errors.push(`Línea ${i + 1}: No se ha seleccionado una sucursal de proveedor`);
          continue;
        }

        // Obtener valores de las columnas (solo provider_sku y stock)
        const provider_sku = row[0]?.toString().trim() || '';
        const stockValue = row[1]?.toString().trim() || '';

        if (!provider_sku) {
          errors.push(`Línea ${i + 1}: provider_sku vacío`);
          continue;
        }

        const stock = parseInt(stockValue);
        if (isNaN(stock) || stock < 0) {
          errors.push(`Línea ${i + 1}: Stock inválido "${stockValue}" (debe ser un número >= 0)`);
          continue;
        }

        // provider_branch_id viene del selector del modal
        // reserved_stock siempre será 0 por defecto
        updates.push({ 
          provider_sku, 
          provider_branch_id: providerBranchId, 
          stock,
          reserved_stock: 0 
        });
        validRows++;
      }

      setProcessedFile({
        fileName: file.name,
        totalRows: rows.length - startIndex,
        validRows,
        errors,
        updates
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      console.error('Error procesando archivo:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!processedFile) return;

    // Guardar valores antes de limpiar el estado
    const updates = processedFile.updates;
    const validRows = processedFile.validRows;

    // Crear AbortController para poder cancelar la operación
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Crear toast de progreso con botón de cancelar
    const toastId = addToast({
      title: 'Actualizando stock masivamente...',
      type: 'loading',
      progress: {
        current: 0,
        total: updates.length,
        updated: 0,
        created: 0,
        skipped: 0,
      },
      onCancel: () => {
        console.log('⚠️ Usuario canceló la actualización');
        cancelOperation(toastId);
      },
    });
    activeToastIdRef.current = toastId;

    // Registrar AbortController en el contexto para persistencia
    registerAbortController(toastId, abortController);

    // Cerrar modal inmediatamente
    setProcessedFile(null);
    setIsUpdating(false);
    onClose();

    // Iniciar actualización en segundo plano
    let finalProgress: { updated: number; created: number; skipped: number } | null = null;

    // Capturar la promesa para evitar errores no manejados
    // NOTA: No verificamos isMountedRef aquí porque queremos que el toast se actualice
    // incluso si el componente se desmontó (navegación)
    onUpdate(
      updates,
      (progress) => {
        // Guardar progreso final
        if (progress.current === progress.total) {
          finalProgress = {
            updated: progress.updated,
            created: progress.created,
            skipped: progress.skipped,
          };
        }

        // Actualizar toast con el progreso (siempre, incluso si el componente se desmontó)
        updateToast(toastId, {
          progress: {
            current: progress.current,
            total: progress.total,
            updated: progress.updated,
            created: progress.created,
            skipped: progress.skipped,
          },
        });
      },
      abortController.signal
    )
      .then(() => {
        // Limpiar referencias locales si el componente sigue montado
        if (isMountedRef.current) {
          abortControllerRef.current = null;
          activeToastIdRef.current = null;
        }

        // Cuando termine, actualizar toast a éxito (siempre, incluso si el componente se desmontó)
        const successMessage = finalProgress
          ? `Actualizados: ${finalProgress.updated} | Creados: ${finalProgress.created}${finalProgress.skipped > 0 ? ` | Omitidos: ${finalProgress.skipped}` : ''}`
          : `Actualizados: ${validRows} productos`;

        updateToast(toastId, {
          title: 'Stock actualizado exitosamente',
          message: successMessage,
          type: 'success',
          duration: 5000,
        });
      })
      .catch((err) => {
        // Verificar si fue cancelado
        const isCancelled = err instanceof DOMException && err.name === 'AbortError' ||
                           err instanceof Error && (err.name === 'AbortError' || err.message.includes('cancelada'));

        // Limpiar referencias locales si el componente sigue montado
        if (isMountedRef.current) {
          abortControllerRef.current = null;
          activeToastIdRef.current = null;
        }

        // Si fue cancelado silenciosamente (usuario o componente desmontado), no mostrar error
        // pero aún así actualizar el toast para que el usuario sepa que se canceló
        if (isCancelled) {
          updateToast(toastId, {
            title: 'Actualización cancelada',
            message: 'La actualización fue cancelada',
            type: 'error',
            duration: 5000,
          });
          return;
        }

        // En caso de error real, actualizar toast
        updateToast(toastId, {
          title: 'Error al actualizar stock',
          message: err instanceof Error ? err.message : 'Error al actualizar el stock',
          type: 'error',
          duration: 5000,
        });
      });
  };

  const handleClose = () => {
    if (!isProcessing && !isUpdating) {
      setProcessedFile(null);
      setError('');
      setProviderBranchId(0);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Actualizar Stock Masivamente" maxWidth="2xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {!processedFile && (
          <div className="space-y-4">
            {/* Selector de sucursal de proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursal de Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                value={providerBranchId || ''}
                onChange={(e) => setProviderBranchId(Number(e.target.value))}
                disabled={isLoadingBranches || isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Selecciona una sucursal...</option>
                {providerBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.provider_name} - {branch.branch_name} ({branch.city})
                  </option>
                ))}
              </select>
              {isLoadingBranches && (
                <p className="text-xs text-gray-500 mt-1">Cargando sucursales...</p>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">Sube un archivo CSV o Excel con las siguientes columnas:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>provider_sku:</strong> Código del proveedor (SKU del proveedor)</li>
                <li><strong>stock:</strong> Nueva cantidad en inventario</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                Nota: La sucursal de proveedor se selecciona arriba y se aplicará a todos los registros del archivo.
              </p>
            </div>

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arrastra tu archivo aquí
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-stock"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="file-upload-stock"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Formatos soportados: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Procesando archivo...</p>
            </div>
          </div>
        )}

        {processedFile && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">
                    Archivo procesado: {processedFile.fileName}
                  </h4>
                  <p className="text-sm text-green-700">
                    {processedFile.validRows} de {processedFile.totalRows} filas válidas
                  </p>
                </div>
              </div>
            </div>

            {processedFile.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Errores encontrados ({processedFile.errors.length}):
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  {processedFile.errors.slice(0, 10).map((error, index) => (
                    <p key={index} className="text-xs text-yellow-700">
                      {error}
                    </p>
                  ))}
                  {processedFile.errors.length > 10 && (
                    <p className="text-xs text-yellow-700 font-medium">
                      ... y {processedFile.errors.length - 10} errores más
                    </p>
                  )}
                </div>
              </div>
            )}

            {processedFile.updates.length > 0 && (
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Vista previa de actualizaciones:
                </h4>
                <div className="mb-2 text-xs text-gray-600">
                  <p>Sucursal seleccionada: <strong>{providerBranches.find(b => b.id === providerBranchId)?.provider_name} - {providerBranches.find(b => b.id === providerBranchId)?.branch_name}</strong></p>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Provider SKU</th>
                        <th className="text-left py-1">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedFile.updates.slice(0, 10).map((update, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-1">{update.provider_sku}</td>
                          <td className="py-1">{update.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {processedFile.updates.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... y {processedFile.updates.length - 10} productos más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleClose}
            disabled={isProcessing || isUpdating}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          {processedFile && processedFile.updates.length > 0 && (
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Actualizar Stock ({processedFile.updates.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

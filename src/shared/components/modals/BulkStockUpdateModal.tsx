'use client';
import { useState, useCallback } from 'react';
import Modal from '../ui/Modal';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkStockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: StockUpdate[]) => Promise<void>;
}

interface StockUpdate {
  product_sku: string;
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

export default function BulkStockUpdateModal({ isOpen, onClose, onUpdate }: BulkStockUpdateModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');

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
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setProcessedFile(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('El archivo está vacío');
      }

      const updates: StockUpdate[] = [];
      const errors: string[] = [];
      let validRows = 0;

      // Skip header if present (check if first line contains expected columns)
      const startIndex = lines[0].toLowerCase().includes('product_sku') || lines[0].toLowerCase().includes('stock') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(/[,;\t]/).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 3) {
          errors.push(`Línea ${i + 1}: Formato incorrecto (se esperan al menos 3 columnas: product_sku, provider_branch_id, stock)`);
          continue;
        }

        const product_sku = columns[0];
        const provider_branch_id_value = columns[1];
        const stockValue = columns[2];
        const reserved_stock_value = columns[3] || '0';

        if (!product_sku) {
          errors.push(`Línea ${i + 1}: product_sku vacío`);
          continue;
        }

        const provider_branch_id = parseInt(provider_branch_id_value);
        if (isNaN(provider_branch_id) || provider_branch_id <= 0) {
          errors.push(`Línea ${i + 1}: provider_branch_id inválido "${provider_branch_id_value}" (debe ser un número > 0)`);
          continue;
        }

        const stock = parseInt(stockValue);
        if (isNaN(stock) || stock < 0) {
          errors.push(`Línea ${i + 1}: Stock inválido "${stockValue}" (debe ser un número >= 0)`);
          continue;
        }

        const reserved_stock = parseInt(reserved_stock_value) || 0;
        if (isNaN(reserved_stock) || reserved_stock < 0) {
          errors.push(`Línea ${i + 1}: reserved_stock inválido "${reserved_stock_value}" (debe ser un número >= 0)`);
          continue;
        }

        updates.push({ 
          product_sku, 
          provider_branch_id, 
          stock,
          reserved_stock 
        });
        validRows++;
      }

      setProcessedFile({
        fileName: file.name,
        totalRows: lines.length - startIndex,
        validRows,
        errors,
        updates
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!processedFile) return;

    setIsUpdating(true);
    try {
      await onUpdate(processedFile.updates);
      setProcessedFile(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el stock');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !isUpdating) {
      setProcessedFile(null);
      setError('');
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
            <div className="text-sm text-gray-600">
              <p className="mb-2">Sube un archivo CSV o Excel con las siguientes columnas:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>product_sku:</strong> Código del producto</li>
                <li><strong>provider_branch_id:</strong> ID de la sucursal del proveedor</li>
                <li><strong>stock:</strong> Nueva cantidad en inventario</li>
                <li><strong>reserved_stock:</strong> (Opcional) Stock reservado</li>
              </ul>
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
                <div className="max-h-40 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Product SKU</th>
                        <th className="text-left py-1">Sucursal ID</th>
                        <th className="text-left py-1">Stock</th>
                        <th className="text-left py-1">Stock Reservado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedFile.updates.slice(0, 10).map((update, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-1">{update.product_sku}</td>
                          <td className="py-1">{update.provider_branch_id}</td>
                          <td className="py-1">{update.stock}</td>
                          <td className="py-1">{update.reserved_stock || 0}</td>
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

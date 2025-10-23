'use client';
import { useState, useCallback } from 'react';
import Modal from '../ui/Modal';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: ProductImport[]) => Promise<void>;
}

interface ProductImport {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  SKU: string;
  brand?: string;
  brand_code?: string;
  provider?: string;
  provider_id?: number;
}

interface ProcessedFile {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: string[];
  products: ProductImport[];
}

const REQUIRED_COLUMNS = ['name', 'SKU', 'price'];
const OPTIONAL_COLUMNS = ['description', 'image', 'category', 'brand', 'brand_code', 'provider', 'provider_id'];

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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

  const downloadTemplate = () => {
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
    const csvContent = headers.join(',') + '\n' + 
      'Kit Amortiguadores Delanteros,KIT-AMOR-001,1250.50,Kit de amortiguadores para suspensión delantera,https://example.com/kit.jpg,D01-C01,GROB,BRND-089,GOVI REFACCIONARIA SA DE CV,1\n' +
      'Pastillas de Freno Delanteras,PAST-FREN-002,450.75,Pastillas de freno cerámicas para uso delantero,https://example.com/pastillas.jpg,D01-C03,BREMBO,BRND-030,GOVI REFACCIONARIA SA DE CV,1';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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

      // Parse header
      const headerLine = lines[0];
      const headers = headerLine.split(/[,;\t]/).map(col => col.trim().toLowerCase().replace(/"/g, ''));
      
      // Validate required columns
      const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col.toLowerCase()));
      if (missingColumns.length > 0) {
        throw new Error(`Columnas requeridas faltantes: ${missingColumns.join(', ')}`);
      }

      const products: ProductImport[] = [];
      const errors: string[] = [];
      let validRows = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(/[,;\t]/).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < headers.length) {
          errors.push(`Línea ${i + 1}: Número incorrecto de columnas (esperadas: ${headers.length}, encontradas: ${columns.length})`);
          continue;
        }

        const product: any = {};
        let hasError = false;

        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          const value = columns[j];

          if (REQUIRED_COLUMNS.includes(header) && !value) {
            errors.push(`Línea ${i + 1}: Campo requerido "${header}" está vacío`);
            hasError = true;
            continue;
          }

          switch (header) {
            case 'name':
            case 'description':
            case 'image':
            case 'category':
            case 'sku':
            case 'brand':
            case 'brand_code':
            case 'provider':
              product[header === 'sku' ? 'SKU' : header] = value || undefined;
              break;
            case 'price':
              const price = parseFloat(value);
              if (isNaN(price) || price < 0) {
                errors.push(`Línea ${i + 1}: Precio inválido "${value}"`);
                hasError = true;
              } else {
                product.price = price;
              }
              break;
            case 'provider_id':
              if (value) {
                const providerId = parseInt(value);
                if (isNaN(providerId)) {
                  errors.push(`Línea ${i + 1}: ID de proveedor inválido "${value}"`);
                  hasError = true;
                } else {
                  product.provider_id = providerId;
                }
              }
              break;
          }
        }

        if (!hasError) {
          products.push(product as ProductImport);
          validRows++;
        }
      }

      setProcessedFile({
        fileName: file.name,
        totalRows: lines.length - 1,
        validRows,
        errors,
        products
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!processedFile) return;

    setIsImporting(true);
    try {
      await onImport(processedFile.products);
      setProcessedFile(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar productos');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !isImporting) {
      setProcessedFile(null);
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Carga Masiva de Productos" maxWidth="2xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {!processedFile && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Sube un archivo CSV o Excel con los datos de productos:</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-red-600">Columnas requeridas:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {REQUIRED_COLUMNS.map(col => (
                        <li key={col}><strong>{col}:</strong> {
                          col === 'name' ? 'Nombre del producto' :
                          col === 'SKU' ? 'Código único del producto' :
                          col === 'price' ? 'Precio del producto' : col
                        }</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">Columnas opcionales:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>description:</strong> Descripción del producto</li>
                      <li><strong>category:</strong> Categoría</li>
                      <li><strong>brand:</strong> Marca</li>
                      <li><strong>brand_code:</strong> Código de marca</li>
                      <li><strong>provider:</strong> Proveedor</li>
                      <li><strong>provider_id:</strong> ID del proveedor</li>
                      <li><strong>image:</strong> URL de imagen</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={downloadTemplate}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </button>
            </div>

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-purple-400 bg-purple-50'
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
                  id="file-upload-import"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="file-upload-import"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer flex items-center"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
                    {processedFile.validRows} de {processedFile.totalRows} productos válidos
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

            {processedFile.products.length > 0 && (
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Vista previa de productos:
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Nombre</th>
                        <th className="text-left py-1">SKU</th>
                        <th className="text-left py-1">Precio</th>
                        <th className="text-left py-1">Categoría</th>
                        <th className="text-left py-1">Marca</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedFile.products.slice(0, 10).map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-1">{product.name}</td>
                          <td className="py-1">{product.SKU}</td>
                          <td className="py-1">${product.price}</td>
                          <td className="py-1">{product.category || '-'}</td>
                          <td className="py-1">{product.brand || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {processedFile.products.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... y {processedFile.products.length - 10} productos más
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
            disabled={isProcessing || isImporting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          {processedFile && processedFile.products.length > 0 && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Importar Productos ({processedFile.products.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

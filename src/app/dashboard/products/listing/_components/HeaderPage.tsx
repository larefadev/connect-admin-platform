import { Plus, Package, Upload, Tag } from "lucide-react";


interface HeaderPageProps {
    setIsCreateModalOpen: (isOpen: boolean) => void;
    setIsStockUpdateModalOpen: (isOpen: boolean) => void;
    setIsBulkImportModalOpen: (isOpen: boolean) => void;
    setIsAutoPartTypeModalOpen: (isOpen: boolean) => void;
}

export const HeaderPage = ({ setIsCreateModalOpen, setIsStockUpdateModalOpen, setIsBulkImportModalOpen, setIsAutoPartTypeModalOpen }: HeaderPageProps) => {
    return (

        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
                <p className="text-gray-600 mt-1">Gestiona tu inventario de productos</p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                </button>
                <button
                    onClick={() => setIsStockUpdateModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                    <Package className="h-4 w-4 mr-2" />
                    Actualizar Stock
                </button>
                <button
                    onClick={() => setIsBulkImportModalOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Carga Masiva
                </button>
                <button
                    onClick={() => setIsAutoPartTypeModalOpen(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                >
                    <Tag className="h-4 w-4 mr-2" />
                    Tipo de Pieza
                </button>
            </div>
        </div>

    )
}
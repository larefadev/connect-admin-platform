import { Product } from "@/core/products/interface/Product";
import { Menu } from "@headlessui/react";
import { MoreHorizontal, Eye, EyeOff, Edit, Trash2, Package } from 'lucide-react';


interface ActionMenuProps {
    product: Product;
    onEdit: (product: Product) => void;
    onViewDetails: (product: Product) => void;
    onUpdateInventory: (product: Product) => void;
    onDelete: (product: Product) => void;
    onToggleVisibility: (product: Product) => void;
}
  


export function ActionMenu({ product, onEdit, onViewDetails, onUpdateInventory, onDelete, onToggleVisibility }: ActionMenuProps) {
    return (
      <Menu as="div" className="relative">
        <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => onViewDetails(product)}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => onEdit(product)}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Producto
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => onUpdateInventory(product)}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                Actualizar Inventario
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => onToggleVisibility(product)}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                {product.is_visible !== false ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Desactivar Producto
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activar Producto
                  </>
                )}
              </button>
            )}
          </Menu.Item>
          <div className="border-t border-gray-100 my-1"></div>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => onDelete(product)}
                className={`w-full flex items-center px-4 py-2 text-sm ${
                  active ? 'bg-red-50 text-red-600' : 'text-red-600'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Producto
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    );
  }
  
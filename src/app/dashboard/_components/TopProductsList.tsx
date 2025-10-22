interface Product {
  name: string;
  sales: number;
  revenue: string;
}

interface TopProductsListProps {
  products: Product[];
}

export function TopProductsList({ products }: TopProductsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Productos Principales</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={`product-${index}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} ventas</p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {product.revenue}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

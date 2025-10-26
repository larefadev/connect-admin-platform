import { Package } from "lucide-react"


interface StatCardProps {
  count: number
}

export const StatCard = ({ count }: StatCardProps)=> {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Productos</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          </div>
        </div>
      </div>
    )
}
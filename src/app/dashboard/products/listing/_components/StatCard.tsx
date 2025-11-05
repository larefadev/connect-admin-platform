import { Package, RefreshCw } from "lucide-react"


interface StatCardProps {
  count: number
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const StatCard = ({ count, onRefresh, isRefreshing = false }: StatCardProps)=> {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Productos</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refrescar productos"
              >
                <RefreshCw 
                  className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} 
                />
              </button>
            )}
          </div>
        </div>
      </div>
    )
}
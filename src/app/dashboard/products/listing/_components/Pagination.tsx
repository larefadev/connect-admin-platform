
interface PaginationProps {
  totalItems: number;
  totalPages?: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ totalItems, totalPages: propTotalPages, currentPage, itemsPerPage, onPageChange }: PaginationProps) {
  const totalPages = propTotalPages || Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return (
      <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">No hay resultados para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between">
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button 
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            canGoPrevious 
              ? 'text-gray-700 bg-white hover:bg-gray-50' 
              : 'text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
        >
          Anterior
        </button>
        <button 
          onClick={handleNext}
          disabled={!canGoNext}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            canGoNext 
              ? 'text-gray-700 bg-white hover:bg-gray-50' 
              : 'text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
        >
          Siguiente
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button 
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                canGoPrevious 
                  ? 'bg-white text-gray-500 hover:bg-gray-50' 
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              Anterior
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageClick(page) : undefined}
                disabled={typeof page !== 'number'}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : typeof page === 'number'
                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                    : 'bg-white text-gray-400 cursor-default'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={handleNext}
              disabled={!canGoNext}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                canGoNext 
                  ? 'bg-white text-gray-500 hover:bg-gray-50' 
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
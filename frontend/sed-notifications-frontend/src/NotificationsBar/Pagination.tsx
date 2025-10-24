import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_PRESETS } from '../services/contracts/INotificationService';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (!isLoading) {
      onPageSizeChange(newPageSize);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* Выбор размера страницы */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Показать:</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          disabled={isLoading}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {PAGE_SIZE_PRESETS.map(preset => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Пагинация */}
      <div className="flex items-center space-x-1">
        {/* Предыдущая страница */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="pagination-previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Номера страниц */}
        <div className="hidden md:flex">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={isLoading}
              className={`
                relative inline-flex items-center px-4 py-2 text-sm font-medium border
                ${page === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : typeof page === 'string'
                    ? 'bg-white border-gray-300 text-gray-700 cursor-default'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              data-testid={`pagination-page-${page}`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Мобильная версия - показать только текущую страницу */}
        <div className="md:hidden">
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* Следующая страница */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="pagination-next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Информация о загрузке */}
      {isLoading && (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Загрузка...</span>
        </div>
      )}
    </div>
  );
};
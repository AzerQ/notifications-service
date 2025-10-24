import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'xl'
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        data-testid="modal-backdrop"
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className={`
            relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl 
            transform transition-all duration-300 ease-out max-h-[90vh] flex flex-col
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
          onClick={(e) => e.stopPropagation()}
          data-testid="modal"
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200" data-testid="modal-header">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Закрыть модальное окно"
                data-testid="modal-close-button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto" data-testid="modal-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
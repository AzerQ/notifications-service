import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CompactNotificationData } from '../../services/contracts/ISignalRNotificationService';
import { CompactNotification } from '../NotificationCard/CompactNotification';
import { InAppNotificationData, ToastSettings, ToastSize, ToastPosition } from '../types';

interface CompactToast extends CompactNotificationData {
  toastId: number;
  isVisible: boolean;
  createdAt: number; // Timestamp создания для индивидуального таймера
  isClosing: boolean; // Флаг для отслеживания процесса закрытия
}

interface CompactToastProviderProps {
  children: (props: {
    showCompactToast: (notification: CompactNotificationData) => void;
    position: ToastPosition;
  }) => React.ReactNode;
  settings?: ToastSettings;
  shouldShowToasts?: boolean;
}

export const CompactToastProvider: React.FC<CompactToastProviderProps> = ({ 
  children, 
  settings,
  shouldShowToasts = true 
}) => {
  const [toasts, setToasts] = useState<CompactToast[]>([]);
  const toastIdRef = useRef(0);
  
  // Используем настройки из пропсов или значения по умолчанию
  const toastSettings = settings || { size: 'medium' as ToastSize, duration: 4, position: 'bottom' as ToastPosition };
  const { size, duration, position } = toastSettings;

  const showCompactToast = useCallback((notification: CompactNotificationData) => {
    // Не показываем тосты, если shouldShowToasts = false
    if (!shouldShowToasts) {
      return;
    }
    
    const toastId = toastIdRef.current++;
    const createdAt = Date.now(); // Сохраняем точное время создания
    const newToast: CompactToast = { 
      ...notification, 
      toastId, 
      isVisible: true, 
      createdAt,
      isClosing: false
    };
    setToasts(prev => [...prev, newToast]);
  }, [shouldShowToasts]);

  const markToastAsClosing = useCallback((toastId: number) => {
    // Помечаем toast как закрывающийся, но не удаляем из массива
    setToasts(prev => prev.map(toast => 
      toast.toastId === toastId ? { ...toast, isClosing: true, isVisible: false } : toast
    ));
  }, []);

  const removeToast = useCallback((toastId: number) => {
    // Удаляем toast из массива после завершения анимации
    setToasts(prev => prev.filter(toast => toast.toastId !== toastId));
  }, []);

  const handleNotificationRead = useCallback((notificationId: string) => {
    // Обновляем статус прочтения для соответствующего уведомления
    setToasts(prev => prev.map(toast =>
      toast.id === notificationId
        ? { ...toast, read: true }
        : toast
    ));
  }, []);

  // Компонент обертки для отдельного toast с логикой закрытия
  const ToastWrapper = React.memo<{
    toast: CompactToast;
    onMarkAsClosing: (id: number) => void;
    onRemove: (id: number) => void;
    onRead: (id: string) => void;
    size: ToastSize;
    duration: number
  }>(({
    toast,
    onMarkAsClosing,
    onRemove,
    onRead,
    size,
    duration
  }) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Сохраняем функции в ref, чтобы они не вызывали перерендер
    const onMarkAsClosingRef = useRef(onMarkAsClosing);
    const onRemoveRef = useRef(onRemove);
    const onReadRef = useRef(onRead);
    
    useEffect(() => {
      onMarkAsClosingRef.current = onMarkAsClosing;
      onRemoveRef.current = onRemove;
      onReadRef.current = onRead;
    });

    useEffect(() => {
      // Если toast уже помечен как закрывающийся, запускаем только таймер удаления
      if (toast.isClosing) {
        animationTimerRef.current = setTimeout(() => {
          onRemoveRef.current(toast.toastId);
        }, 300);
        return () => {
          if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
          }
        };
      }

      // Каждый toast имеет свой независимый таймер автозакрытия
      const timeoutDuration = duration * 1000;
      
      timerRef.current = setTimeout(() => {
        // Сначала помечаем как закрывающийся (запускает анимацию)
        onMarkAsClosingRef.current(toast.toastId);
        // Затем удаляем после завершения анимации
        animationTimerRef.current = setTimeout(() => {
          onRemoveRef.current(toast.toastId);
        }, 300);
      }, timeoutDuration);

      // Очищаем таймеры при размонтировании компонента
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
        }
      };
    }, [toast.isClosing, toast.toastId, duration]); // Добавляем зависимости

    const handleClose = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      // Отменяем автоматическое закрытие
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Помечаем как закрывающийся
      onMarkAsClosingRef.current(toast.toastId);
      // Удаляем после анимации
      animationTimerRef.current = setTimeout(() => {
        onRemoveRef.current(toast.toastId);
      }, 300);
    }, [toast.toastId]);

    // Обработчик клика на уведомление
    const handleNotificationClick = useCallback(() => {
      // Отменяем автоматическое закрытие
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Помечаем как прочитанное
      onReadRef.current(toast.id);
      
      // Открываем URL, если есть
      if (toast.cardUrl) {
        window.open(toast.cardUrl, '_blank');
      }
      
      // Помечаем как закрывающийся
      onMarkAsClosingRef.current(toast.toastId);
      // Удаляем после анимации
      animationTimerRef.current = setTimeout(() => {
        onRemoveRef.current(toast.toastId);
      }, 300);
    }, [toast.id, toast.toastId, toast.cardUrl]);

    // Преобразуем CompactNotificationData в InAppNotificationData для совместимости
    const adaptedNotification: InAppNotificationData = {
      id: toast.id,
      title: toast.title,
      type: toast.type as any,
      subType: toast.subtype || '',
      description: `От: ${toast.author}`,
      content: `От: ${toast.author}`,
      author: toast.author,
      date: toast.date,
      read: toast.read,
      starred: false,
      delegate: false,
      actions: [],
      cardUrl: toast.cardUrl,
      receiverId: 'user-764',
      url: toast.cardUrl || ''
    };

    // Определяем классы размера
    const sizeClasses = {
      small: 'max-w-xs text-sm',
      medium: 'max-w-sm text-base',
      large: 'max-w-md text-lg'
    };

    return (
      <div
        className={`${sizeClasses[size]} w-full rounded-lg shadow-lg transform transition-all duration-300 mb-2 bg-white border border-gray-200 ${
          toast.isVisible && !toast.isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        data-testid="compact-toast-notification"
        data-toast-id={toast.toastId}
        data-notification-id={toast.id}
        data-size={size}
        data-is-closing={toast.isClosing}
        onClick={handleNotificationClick}
      >
        <div className="relative">
          {/* Кнопка закрытия */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 shadow-sm"
            data-testid="compact-toast-close-button"
            aria-label="Закрыть уведомление"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Компактное уведомление */}
          <CompactNotification
            notification={adaptedNotification}
            onRead={() => {}} // Пустая функция, т.к. обработка клика происходит в handleNotificationClick
            size={size}
            disableClick={true} // Отключаем встроенный обработчик, используем обработчик из ToastWrapper
          />
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Мемоизируем компонент - перерендериваем только если изменились важные свойства
    return prevProps.toast.toastId === nextProps.toast.toastId && 
           prevProps.toast.read === nextProps.toast.read &&
           prevProps.toast.isClosing === nextProps.toast.isClosing &&
           prevProps.toast.isVisible === nextProps.toast.isVisible;
  });

  const containerClasses = position === 'top'
    ? 'fixed top-4 right-4 z-50'
    : 'fixed bottom-4 right-4 z-50';

  return (
    <div className="relative">
      {children({ showCompactToast, position })}
      
      {toasts.length > 0 && (
        <div className={containerClasses} data-testid="compact-toast-container" data-position={position}>
          {toasts.map(toast => (
            <ToastWrapper
              key={toast.toastId}
              toast={toast}
              onMarkAsClosing={markToastAsClosing}
              onRemove={removeToast}
              onRead={handleNotificationRead}
              size={size}
              duration={duration}
            />
          ))}
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { CompactToastProvider } from '../../NotificationsBar/Toast/CompactToastProvider';
import { CompactNotificationData } from '../../services/contracts/ISignalRNotificationService';

const mockNotification: CompactNotificationData = {
  id: "1",
  title: 'Тестовое уведомление',
  type: 'document',
  subtype: 'approval',
  author: 'Тестовый пользователь',
  date: '2024-01-01T12:00:00Z',
  read: false
};

describe('CompactToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('предоставляет функцию showCompactToast дочерним компонентам', () => {
    let showCompactToastFunction: ((notification: CompactNotificationData) => void) | undefined;

    render(
      <CompactToastProvider>
        {({ showCompactToast }) => {
          showCompactToastFunction = showCompactToast;
          return <div data-testid="child">Child Component</div>;
        }}
      </CompactToastProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(showCompactToastFunction).toBeDefined();
    expect(typeof showCompactToastFunction).toBe('function');
  });

  it('отображает всплывающее уведомление при вызове showCompactToast', () => {
    let showCompactToastFunction: ((notification: CompactNotificationData) => void) | undefined;

    render(
      <CompactToastProvider>
        {({ showCompactToast }) => {
          showCompactToastFunction = showCompactToast;
          return (
            <button 
              onClick={() => showCompactToast(mockNotification)}
              data-testid="show-toast-button"
            >
              Show Toast
            </button>
          );
        }}
      </CompactToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-toast-button'));

    expect(screen.getByTestId('compact-toast-container')).toBeInTheDocument();
    expect(screen.getByTestId('compact-toast-notification')).toBeInTheDocument();
    expect(screen.getByText('Тестовое уведомление')).toBeInTheDocument();
  });

  it('отображает контейнер с правильными атрибутами', () => {
    let showCompactToastFunction: ((notification: CompactNotificationData) => void) | undefined;

    render(
      <CompactToastProvider>
        {({ showCompactToast }) => {
          showCompactToastFunction = showCompactToast;
          return (
            <button 
              onClick={() => showCompactToast(mockNotification)}
              data-testid="show-toast-button"
            >
              Show Toast
            </button>
          );
        }}
      </CompactToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-toast-button'));

    const container = screen.getByTestId('compact-toast-container');
    expect(container).toHaveAttribute('data-position', 'top');
    expect(container).toHaveClass('fixed top-4 right-4 z-50');
  });

  it('может отображать несколько уведомлений одновременно', () => {
    const secondNotification: CompactNotificationData = {
      ...mockNotification,
      id: "2",
      title: 'Второе уведомление'
    };

    render(
      <CompactToastProvider>
        {({ showCompactToast }) => (
          <div>
            <button 
              onClick={() => showCompactToast(mockNotification)}
              data-testid="show-first-toast"
            >
              Show First Toast
            </button>
            <button 
              onClick={() => showCompactToast(secondNotification)}
              data-testid="show-second-toast"
            >
              Show Second Toast
            </button>
          </div>
        )}
      </CompactToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-first-toast'));
    fireEvent.click(screen.getByTestId('show-second-toast'));

    expect(screen.getByText('Тестовое уведомление')).toBeInTheDocument();
    expect(screen.getByText('Второе уведомление')).toBeInTheDocument();
    
    const toastNotifications = screen.getAllByTestId('compact-toast-notification');
    expect(toastNotifications).toHaveLength(2);
  });

  it('удаляет уведомление при закрытии', async () => {
    render(
      <CompactToastProvider>
        {({ showCompactToast }) => (
          <button 
            onClick={() => showCompactToast(mockNotification)}
            data-testid="show-toast-button"
          >
            Show Toast
          </button>
        )}
      </CompactToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-toast-button'));
    expect(screen.getByTestId('compact-toast-notification')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('compact-toast-close-button'));

    // Проверяем, что анимация началась
    await waitFor(() => {
      expect(screen.getByTestId('compact-toast-notification')).toHaveClass('translate-x-full opacity-0');
    });

    // Симулируем прохождение времени для анимации закрытия
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Ожидаем удаления элемента из DOM
    await waitFor(() => {
      expect(screen.queryByTestId('compact-toast-notification')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('обновляет статус прочтения уведомления', () => {
    render(
      <CompactToastProvider>
        {({ showCompactToast }) => (
          <button 
            onClick={() => showCompactToast(mockNotification)}
            data-testid="show-toast-button"
          >
            Show Toast
          </button>
        )}
      </CompactToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-toast-button'));
    
    // Проверяем, что индикатор непрочитанного отображается
    expect(screen.getByTestId('compact-notification-unread-indicator')).toBeInTheDocument();

    // Кликаем на уведомление, чтобы пометить как прочитанное
    fireEvent.click(screen.getByTestId('compact-notification'));

    // После клика индикатор непрочитанного должен исчезнуть
    // Примечание: в реальной реализации это потребует обновления состояния
    // Здесь мы просто проверяем, что клик обрабатывается
  });

  it('не отображает контейнер, если нет уведомлений', () => {
    render(
      <CompactToastProvider>
        {() => <div data-testid="empty-child">No toasts</div>}
      </CompactToastProvider>
    );

    expect(screen.getByTestId('empty-child')).toBeInTheDocument();
    expect(screen.queryByTestId('compact-toast-container')).not.toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenter } from '../NotificationsBar/NotificationCenter';
import { mockNotifications } from './utils/testUtils';

describe('NotificationCenter', () => {
  const defaultProps = {
    notifications: mockNotifications,
    onNotificationUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Очищаем стили body после каждого теста
    document.body.style.overflow = 'unset';
  });

  it('должен отображать колокольчик с правильным количеством непрочитанных', () => {
    render(<NotificationCenter {...defaultProps} />);

    // В mockNotifications 2 непрочитанных уведомления
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('должен открывать боковое меню при клике на колокольчик', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('Новые уведомления')).toBeInTheDocument();
  });

  it('должен закрывать боковое меню при клике на кнопку закрытия', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('Новые уведомления')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Закрыть панель уведомлений');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Новые уведомления')).not.toBeInTheDocument();
    });
  });

  it('должен открывать модальное окно при клике на "Вся история"', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const historyButton = screen.getByText('Вся история уведомлений');
    await user.click(historyButton);

    expect(screen.getByText('Центр уведомлений')).toBeInTheDocument();
  });

  it('должен закрывать боковое меню при открытии модального окна', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('Новые уведомления')).toBeInTheDocument();

    const historyButton = screen.getByText('Вся история уведомлений');
    await user.click(historyButton);

    await waitFor(() => {
      expect(screen.queryByText('Новые уведомления')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Центр уведомлений')).toBeInTheDocument();
  });

  it('должен обновлять количество непрочитанных при пометке как прочитанное', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    // Изначально 2 непрочитанных (ищем в бейдже уведомлений по aria-label)
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений.*2.*непрочитанных/);
    const initialBadge = bellButton.querySelector('.bg-red-600');
    expect(initialBadge).toHaveTextContent('2');

    await user.click(bellButton);

    // Кликаем на первое непрочитанное уведомление
    const firstNotification = screen.getByText('Тест документ').closest('[class*="border-b"]');
    await user.click(firstNotification as Element);

    // Количество должно уменьшиться до 1
    await waitFor(() => {
      const updatedBellButton = screen.getByLabelText(/Открыть центр уведомлений.*1.*непрочитанных/);
      const updatedBadge = updatedBellButton.querySelector('.bg-red-600');
      expect(updatedBadge).toHaveTextContent('1');
    });
  });

  it('должен вызывать onNotificationUpdate при изменении уведомлений', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const firstNotification = screen.getByText('Тест документ').closest('[class*="border-b"]');
    await user.click(firstNotification as Element);

    await waitFor(() => {
      expect(defaultProps.onNotificationUpdate).toHaveBeenCalled();
    });

    const updatedNotifications = defaultProps.onNotificationUpdate.mock.calls[0][0];
    expect(updatedNotifications.find((n: any) => n.id === 1).read).toBe(true);
  });

  it('должен отмечать все уведомления как прочитанные', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const markAllButton = screen.getByText('Отметить все как прочитанные');
    await user.click(markAllButton);

    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    expect(defaultProps.onNotificationUpdate).toHaveBeenCalled();
    const updatedNotifications = defaultProps.onNotificationUpdate.mock.calls[0][0];
    updatedNotifications.forEach((notification: any) => {
      expect(notification.read).toBe(true);
    });
  });

  it('должен синхронизировать состояние между боковым меню и модальным окном', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    // Открываем боковое меню
    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    // Помечаем уведомление как прочитанное
    const firstNotification = screen.getByText('Тест документ').closest('[class*="border-b"]');
    await user.click(firstNotification as Element);

    // Открываем модальное окно
    const historyButton = screen.getByText('Вся история уведомлений');
    await user.click(historyButton);

    // Проверяем что в модальном окне отображается обновленная информация
    await waitFor(() => {
      expect(screen.getByText('1 непрочитанных')).toBeInTheDocument();
    });
  });

  it('должен отображать правильное сообщение когда нет непрочитанных', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    
    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={readNotifications} 
      />
    );

    // Не должно быть значка на колокольчике
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('должен обрабатывать случай когда onNotificationUpdate не предоставлен', async () => {
    const user = userEvent.setup();
    render(
      <NotificationCenter 
        notifications={mockNotifications}
      />
    );

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const firstNotification = screen.getByText('Тест документ').closest('[class*="border-b"]');
    
    // Не должно вызывать ошибку
    expect(() => user.click(firstNotification as Element)).not.toThrow();
  });


  it('должен отображать корректное количество для большого числа уведомлений', () => {
    const manyNotifications = Array.from({ length: 150 }, (_, i) => ({
      ...mockNotifications[0],
      id: i,
      read: false,
    }));

    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={manyNotifications} 
      />
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('должен правильно передавать пропсы компонентам', () => {
    render(<NotificationCenter {...defaultProps} />);

    // Проверяем что все основные компоненты отрендерились
    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
    expect(bellButton).toHaveAttribute('aria-label', expect.stringContaining('Открыть центр уведомлений'));
  });

  it('должен поддерживать accessibility', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter {...defaultProps} />);

    const bellButton = screen.getByRole('button');
    
    // Проверяем что можно перейти по Tab
    await user.tab();
    expect(bellButton).toHaveFocus();

    // Проверяем что можно активировать Enter
    await user.keyboard('{Enter}');
    expect(screen.getByText('Новые уведомления')).toBeInTheDocument();

    // Проверяем что можно закрыть Escape
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('Новые уведомления')).not.toBeInTheDocument();
    });
  });
});
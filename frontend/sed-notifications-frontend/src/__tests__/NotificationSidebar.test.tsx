import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationSidebar } from '../NotificationsBar/NotificationSidebar';
import { mockNotifications } from './utils/testUtils';

describe('NotificationSidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    notifications: mockNotifications,
    onNotificationRead: jest.fn(),
    onOpenFullHistory: jest.fn(),
    onOpenSettings: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Очищаем стили body после каждого теста
    document.body.style.overflow = 'unset';
  });

  it('должен отображаться когда isOpen = true', () => {
    render(<NotificationSidebar {...defaultProps} />);
    
    expect(screen.getByText('Новые уведомления')).toBeInTheDocument();
    expect(screen.getByText('Вся история уведомлений')).toBeInTheDocument();
  });

  it('не должен отображаться когда isOpen = false', () => {
    render(<NotificationSidebar {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Новые уведомления')).not.toBeInTheDocument();
  });

  it('должен отображать только непрочитанные уведомления', () => {
    render(<NotificationSidebar {...defaultProps} />);
    
    // Должны отображаться только непрочитанные (id: 1, 3)
    expect(screen.getByText('Тест документ')).toBeInTheDocument();
    expect(screen.getByText('Системное уведомление')).toBeInTheDocument();
    
    // Прочитанное уведомление не должно отображаться (id: 2)
    expect(screen.queryByText('Тест задание')).not.toBeInTheDocument();
  });

  it('должен отображать счетчик непрочитанных уведомлений', () => {
    render(<NotificationSidebar {...defaultProps} />);
    
    // 2 непрочитанных уведомления из mockNotifications
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('должен закрываться при клике на кнопку X', async () => {
    const user = userEvent.setup();
    render(<NotificationSidebar {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Закрыть панель уведомлений');
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('должен закрываться при клике на backdrop', async () => {
    const user = userEvent.setup();
    render(<NotificationSidebar {...defaultProps} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    expect(backdrop).toBeInTheDocument();
    
    await user.click(backdrop as Element);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('должен закрываться при нажатии Escape', async () => {
    render(<NotificationSidebar {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('должен блокировать прокрутку body когда открыт', () => {
    const { rerender } = render(<NotificationSidebar {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('unset');
    
    rerender(<NotificationSidebar {...defaultProps} isOpen={true} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('должен открывать полную историю при клике на кнопку', async () => {
    const user = userEvent.setup();
    render(<NotificationSidebar {...defaultProps} />);
    
    const historyButton = screen.getByText('Вся история уведомлений');
    await user.click(historyButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onOpenFullHistory).toHaveBeenCalledTimes(1);
  });

  it('должен отображать сообщение когда нет непрочитанных уведомлений', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    
    render(
      <NotificationSidebar 
        {...defaultProps} 
        notifications={readNotifications} 
      />
    );
    
    expect(screen.getByText('Все прочитано!')).toBeInTheDocument();
    expect(screen.getByText('У вас нет новых уведомлений. Проверьте полную историю для просмотра всех уведомлений.')).toBeInTheDocument();
  });

  it('должен вызывать markAllAsRead при клике на соответствующую кнопку', async () => {
    const user = userEvent.setup();
    render(<NotificationSidebar {...defaultProps} />);
    
    const markAllButton = screen.getByText('Отметить все как прочитанные');
    await user.click(markAllButton);
    
    expect(defaultProps.markAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('не должен отображать кнопку "Отметить все как прочитанные" если нет непрочитанных', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    
    render(
      <NotificationSidebar 
        {...defaultProps} 
        notifications={readNotifications} 
      />
    );
    
    expect(screen.queryByText('Отметить все как прочитанные')).not.toBeInTheDocument();
  });

  it('должен иметь правильные классы для анимации', () => {
    const { container } = render(<NotificationSidebar {...defaultProps} />);
    
    const sidebar = container.querySelector('.fixed.top-0.right-0');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('должен передавать onNotificationRead в CompactNotification', async () => {
    const user = userEvent.setup();
    render(<NotificationSidebar {...defaultProps} />);
    
    // Клик по первому уведомлению
    const firstNotification = screen.getByText('Тест документ').closest('[class*="border-b"]');
    expect(firstNotification).toBeInTheDocument();
    
    await user.click(firstNotification as Element);
    
    expect(defaultProps.onNotificationRead).toHaveBeenCalledWith(1);
  });

  it('должен вызывать onOpenSettings при клике на кнопку настроек', () => {
    render(<NotificationSidebar {...defaultProps} />);
    
    const settingsButton = screen.getByTestId('notification-sidebar-settings-button');
    fireEvent.click(settingsButton);
    
    expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('должен отображать кнопку настроек', () => {
    render(<NotificationSidebar {...defaultProps} />);
    
    expect(screen.getByTestId('notification-sidebar-settings-button')).toBeInTheDocument();
    expect(screen.getByText('Настройки уведомлений')).toBeInTheDocument();
  });
});
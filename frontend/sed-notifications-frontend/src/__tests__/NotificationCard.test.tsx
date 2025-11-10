import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCard } from '../NotificationsBar/NotificationCard/NotificationCard';
import { createMockNotification, createMockToastFunction } from './utils/testUtils';

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('NotificationCard', () => {
  const mockProps = {
    onToggleRead: jest.fn(),
    onToggleStar: jest.fn(),
    onActionComplete: jest.fn(),
    showToast: createMockToastFunction(),
    onNotificationClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать основную информацию о уведомлении', () => {
    const notification = createMockNotification({
      title: 'Test Notification',
      content: 'Test Description',
      author: 'Test Author',
      subType: 'Test Subtype',
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test Subtype')).toBeInTheDocument();
  });

  it('должен отображать правильные стили для непрочитанного уведомления', () => {
    const notification = createMockNotification({ read: false });

    const { container } = render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('bg-blue-100', 'border-blue-300');
  });

  it('должен отображать правильные стили для прочитанного уведомления', () => {
    const notification = createMockNotification({ read: true });

    const { container } = render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'border-gray-200');
  });

  it('должен отображать значок делегата если delegate=true', () => {
    const notification = createMockNotification({ delegate: true });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    expect(screen.getByText('По замещению')).toBeInTheDocument();
  });

  it('должен переключать статус избранного при клике на звездочку', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({
      id: "123",
      starred: false,
      read: false,
    });
    
    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const starButton = screen.getByRole('button', { name: /добавить в избранное/i });
    await user.click(starButton);

    expect(mockProps.onToggleStar).toHaveBeenCalledWith(123);
  });

  it('должен переключать статус прочтения при клике на глаз', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({ id: "123", read: false });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const readButton = screen.getByTitle('Отметить как прочитанное');
    await user.click(readButton);

    expect(mockProps.onToggleRead).toHaveBeenCalledWith(123);
  });

  it('должен отображать кнопку "Открыть карточку" для уведомлений с cardUrl', () => {
    const notification = createMockNotification({
      cardUrl: '/test-url',
      type: 'document',
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    expect(screen.getByText('Открыть карточку')).toBeInTheDocument();
  });

  it('не должен отображать кнопку "Открыть карточку" для системных уведомлений', () => {
    const notification = createMockNotification({
      cardUrl: '/test-url',
      type: 'system',
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    expect(screen.queryByText('Открыть карточку')).not.toBeInTheDocument();
  });

  it('должен отображать действия уведомления', () => {
    const notification = createMockNotification({
      actions: [
        { name: 'approve', label: 'Одобрить', url: 'test://approve' },
        { name: 'reject', label: 'Отклонить', url: 'test://reject' },
      ],
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    expect(screen.getAllByText('Одобрить')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Отклонить')[0]).toBeInTheDocument();
  });

  it('должен отображать выпадающее меню для дополнительных действий', () => {
    const notification = createMockNotification({
      actions: [
        { name: 'action1', label: 'Action 1', url: 'test://action1' },
        { name: 'action2', label: 'Action 2', url: 'test://action2' },
      ],
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const moreButton = screen.getByTitle('Дополнительные действия');
    expect(moreButton).toBeInTheDocument();
  });

  it('должен вызывать onNotificationClick при клике на непрочитанное уведомление', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({ id: "123", read: false });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const card = screen.getByText('Mock Notification').closest('div');
    await user.click(card as Element);

    expect(mockProps.onNotificationClick).toHaveBeenCalledWith(123);
  });

  it('не должен вызывать onNotificationClick при клике на прочитанное уведомление', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({ read: true });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const card = screen.getByText('Mock Notification').closest('div');
    await user.click(card as Element);

    expect(mockProps.onNotificationClick).not.toHaveBeenCalled();
  });

  it('должен показывать toast при открытии карточки', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({
      cardUrl: '/test-url',
      type: 'document',
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const openButton = screen.getByText('Открыть карточку');
    await user.click(openButton);

    expect(mockProps.showToast).toHaveBeenCalledWith({
      title: 'Информация',
      message: 'Открытие карточки: /test-url',
      type: 'info',
    });
  });

  it('должен отмечать как прочитанное при открытии карточки непрочитанного уведомления', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({
      id: "123",
      cardUrl: '/test-url',
      type: 'document',
      read: false,
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    const openButton = screen.getByText('Открыть карточку');
    await user.click(openButton);

    expect(mockProps.onActionComplete).toHaveBeenCalledWith(123);
  });

  it('должен отображать форматированную дату', () => {
    const notification = createMockNotification({
      date: '2024-01-15T10:30:00',
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    expect(screen.getByText(/15\.01\.2024/)).toBeInTheDocument();
  });

  it('должен предотвращать всплытие событий при клике на интерактивные элементы', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({
      id: "123",
      read: false,
      starred: false,
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    // Клик на звездочку не должен вызывать onNotificationClick
    const starButton = screen.getByRole('button', { name: /добавить в избранное/i });
    await user.click(starButton);

    expect(mockProps.onToggleStar).toHaveBeenCalled();
    expect(mockProps.onNotificationClick).not.toHaveBeenCalled();
  });

  it('должен отображать правильные иконки для прочитанных и непрочитанных уведомлений', () => {
    const unreadNotification = createMockNotification({ read: false });

    const { rerender } = render(
      <NotificationCard
        notification={unreadNotification}
        {...mockProps}
      />
    );

    expect(screen.getByTitle('Отметить как прочитанное')).toBeInTheDocument();

    const readNotification = createMockNotification({ read: true });
    rerender(
      <NotificationCard
        notification={readNotification}
        {...mockProps}
      />
    );

    expect(screen.getByTitle('Отметить как непрочитанное')).toBeInTheDocument();
  });

  it('должен скрывать действия на мобильных устройствах если их больше 2', () => {
    const notification = createMockNotification({
      actions: [
        { name: 'action1', label: 'Action 1', url: 'test://action1' },
        { name: 'action2', label: 'Action 2', url: 'test://action2' },
        { name: 'action3', label: 'Action 3', url: 'test://action3' },
        { name: 'action4', label: 'Action 4', url: 'test://action4' },
      ],
    });

    render(
      <NotificationCard
        notification={notification}
        {...mockProps}
      />
    );

    // На мобильных должно показываться только первые 2 действия + кнопка +2
    const mobileContainer = document.querySelector('.md\\:hidden');
    expect(mobileContainer).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
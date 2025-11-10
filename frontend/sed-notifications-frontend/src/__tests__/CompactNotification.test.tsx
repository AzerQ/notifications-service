import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompactNotification } from '../NotificationsBar/NotificationCard/CompactNotification';
import { createMockNotification } from './utils/testUtils';

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('CompactNotification', () => {
  const mockOnRead = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать основную информацию о уведомлении', () => {
    const notification = createMockNotification({
      title: 'Test Title',
      subType: 'Test Type',
      content: 'Test Description',
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const compactNotification = screen.getByTestId('compact-notification');
    expect(compactNotification).toBeInTheDocument();
    expect(compactNotification).toHaveAttribute('data-notification-id', notification.id.toString());
    
    expect(screen.getByTestId('compact-notification-title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('compact-notification-description')).toHaveTextContent('Test Description');
  });

  it('должен отображать правильную иконку в зависимости от типа', () => {
    const notification = createMockNotification({ type: 'document' });
    
    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const icon = screen.getByTestId('compact-notification-icon');
    expect(icon).toBeInTheDocument();
    
    const compactNotification = screen.getByTestId('compact-notification');
    expect(compactNotification).toHaveAttribute('data-notification-type', 'document');
  });

  it('должен отображать относительное время', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    const notification = createMockNotification({
      date: twoHoursAgo.toISOString(),
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const timeElement = screen.getByTestId('compact-notification-time');
    expect(timeElement).toHaveTextContent('2 ч назад');
  });

  it('должен отображать "только что" для очень недавних уведомлений', () => {
    const now = new Date();
    const notification = createMockNotification({
      date: now.toISOString(),
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const timeElement = screen.getByTestId('compact-notification-time');
    expect(timeElement).toHaveTextContent('только что');
  });

  it('должен отображать ссылку "Открыть →" для уведомлений с cardUrl', () => {
    const notification = createMockNotification({
      cardUrl: '/test-url',
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const linkIndicator = screen.getByTestId('compact-notification-link-indicator');
    expect(linkIndicator).toHaveTextContent('Открыть →');
  });

  it('не должен отображать ссылку для уведомлений без cardUrl', () => {
    const notification = createMockNotification({
      cardUrl: undefined,
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    expect(screen.queryByTestId('compact-notification-link-indicator')).not.toBeInTheDocument();
  });

  it('должен вызывать onRead при клике', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({ id: "123" });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const notificationElement = screen.getByTestId('compact-notification');
    await user.click(notificationElement);
    
    expect(mockOnRead).toHaveBeenCalledWith(123);
  });

  it('должен открывать ссылку в новой вкладке при клике на уведомление с cardUrl', async () => {
    const user = userEvent.setup();
    const notification = createMockNotification({
      cardUrl: '/test-url',
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const notificationElement = screen.getByText('Mock Notification').closest('div');
    await user.click(notificationElement as Element);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/test-url', '_blank');
    expect(mockOnRead).toHaveBeenCalled();
  });

  it('должен иметь hover эффект для уведомлений с cardUrl', () => {
    const notification = createMockNotification({
      cardUrl: '/test-url',
    });

    const { container } = render(
      <CompactNotification notification={notification} onRead={mockOnRead} />
    );
    
    const notificationElement = container.firstChild;
    expect(notificationElement).toHaveClass('hover:bg-blue-50');
  });

  it('должен отображать индикатор непрочитанного уведомления', () => {
    const notification = createMockNotification();
    
    const { container } = render(
      <CompactNotification notification={notification} onRead={mockOnRead} />
    );
    
    const indicator = container.querySelector('.w-2.h-2.bg-blue-600.rounded-full');
    expect(indicator).toBeInTheDocument();
  });

  it('должен обрезать длинное описание', () => {
    const notification = createMockNotification({
      description: 'Very long description that should be truncated to two lines maximum. This text is intentionally very long to test the line clamping functionality.',
    });

    const { container } = render(
      <CompactNotification notification={notification} onRead={mockOnRead} />
    );
    
    const description = screen.getByText(/Very long description/);
    expect(description).toHaveClass('line-clamp-2');
  });

  it('должен правильно форматировать время для минут', () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    const notification = createMockNotification({
      date: thirtyMinutesAgo.toISOString(),
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    expect(screen.getByText('30 мин назад')).toBeInTheDocument();
  });

  it('должен правильно форматировать время для дней', () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const notification = createMockNotification({
      date: threeDaysAgo.toISOString(),
    });

    render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    expect(screen.getByText('3 д назад')).toBeInTheDocument();
  });

  it('должен отображать правильные цвета иконок для разных подтипов', () => {
    const { container, rerender } = render(
      <CompactNotification
        notification={createMockNotification({
          type: 'system',
          subType: 'security'
        })}
        onRead={mockOnRead}
      />
    );
    
    let icon = container.querySelector('svg');
    expect(icon).toHaveClass('text-red-500');
    
    rerender(
      <CompactNotification
        notification={createMockNotification({
          type: 'task',
          subType: 'deadline'
        })}
        onRead={mockOnRead}
      />
    );
    
    icon = container.querySelector('svg');
    expect(icon).toHaveClass('text-red-500');
  });

  it('должен иметь правильную accessibility структуру', () => {
    const notification = createMockNotification({
      title: 'Accessible Title',
      content: 'Accessible Description',
    });

    const { container } = render(<CompactNotification notification={notification} onRead={mockOnRead} />);
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('cursor-pointer');
    expect(element).toHaveAttribute('role', 'button');
  });
});

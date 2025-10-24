import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastNotification } from '../../NotificationsBar/Toast/ToastNotification';

// Mock для tryExecuteAppAction
jest.mock('../../NotificationsBar/notificationsActions', () => ({
  tryExecuteAppAction: jest.fn(),
}));

const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('ToastNotification', () => {
  const defaultProps = {
    id: 1,
    title: 'Test Toast',
    message: 'Test message',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('должен отображать заголовок и сообщение', () => {
    render(<ToastNotification {...defaultProps} />);

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('должен отображать правильную иконку для типа success', () => {
    const { container } = render(
      <ToastNotification {...defaultProps} type="success" />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('должен отображать правильную иконку для типа error', () => {
    const { container } = render(
      <ToastNotification {...defaultProps} type="error" />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('должен отображать правильную иконку для типа warning', () => {
    const { container } = render(
      <ToastNotification {...defaultProps} type="warning" />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  it('должен отображать правильную иконку для типа info (по умолчанию)', () => {
    const { container } = render(
      <ToastNotification {...defaultProps} type="info" />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('должен использовать тип info по умолчанию', () => {
    const { container } = render(<ToastNotification {...defaultProps} />);

    expect(container.firstChild).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('должен автоматически закрываться через указанное время', async () => {
    render(<ToastNotification {...defaultProps} duration={3000} />);

    // Прокручиваем время на 3 секунды
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledWith(1);
    });
  });

  it('должен использовать длительность 5 секунд по умолчанию', async () => {
    render(<ToastNotification {...defaultProps} />);

    // Не должен закрыться через 3 секунды
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    // Должен закрыться через 5 секунд
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledWith(1);
    });
  });

  it('должен закрываться при клике на кнопку X', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ToastNotification {...defaultProps} />);

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledWith(1);
    });
  });

  it('должен открывать HTTP ссылку в новой вкладке при клике', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastNotification 
        {...defaultProps} 
        actionUrl="https://example.com" 
      />
    );

    const toast = screen.getByText('Test Toast').closest('div');
    await user.click(toast as Element);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('должен вызывать tryExecuteAppAction для app action URL', async () => {
    const { tryExecuteAppAction } = require('../../NotificationsBar/notificationsActions');
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <ToastNotification 
        {...defaultProps} 
        actionUrl="appactions://testAction" 
      />
    );

    const toast = screen.getByText('Test Toast').closest('div');
    await user.click(toast as Element);

    expect(tryExecuteAppAction).toHaveBeenCalledWith('appactions://testAction');
  });

  it('не должен выполнять действие при клике если нет actionUrl', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ToastNotification {...defaultProps} />);

    const toast = screen.getByText('Test Toast').closest('div');
    await user.click(toast as Element);

    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('должен иметь правильные CSS классы для анимации', () => {
    const { container } = render(<ToastNotification {...defaultProps} />);

    const toast = container.firstChild;
    expect(toast).toHaveClass(
      'transform',
      'transition-all',
      'duration-300',
      'translate-x-0',
      'opacity-100'
    );
  });

  it('должен очищать таймер при unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = render(<ToastNotification {...defaultProps} />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('должен иметь правильную структуру для accessibility', () => {
    render(<ToastNotification {...defaultProps} />);

    const toast = screen.getByText('Test Toast').closest('[class*="p-4"]');
    expect(toast).toHaveClass('p-4');
    
    const closeButton = screen.getByText('✕');
    expect(closeButton).toHaveAttribute('type', 'button');
  });

  it('должен корректно обрабатывать клик на кнопку закрытия без всплытия', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const mockActionUrl = 'https://example.com';
    
    render(
      <ToastNotification 
        {...defaultProps} 
        actionUrl={mockActionUrl}
      />
    );

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    // Ждем выполнения setTimeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Не должен открыть ссылку при клике на кнопку закрытия
    expect(mockWindowOpen).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalledWith(1);
  });

  it('должен правильно определять HTTP и HTTPS ссылки', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    // Тест HTTP ссылки
    const { rerender } = render(
      <ToastNotification 
        {...defaultProps} 
        actionUrl="http://example.com" 
      />
    );

    let toast = screen.getByText('Test Toast').closest('div');
    await user.click(toast as Element);

    expect(mockWindowOpen).toHaveBeenCalledWith('http://example.com', '_blank');

    mockWindowOpen.mockClear();

    // Тест HTTPS ссылки
    rerender(
      <ToastNotification 
        {...defaultProps} 
        actionUrl="https://secure-example.com" 
      />
    );

    toast = screen.getByText('Test Toast').closest('div');
    await user.click(toast as Element);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://secure-example.com', '_blank');
  });
});
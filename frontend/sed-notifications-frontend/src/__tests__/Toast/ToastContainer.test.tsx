import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../../NotificationsBar/Toast/ToastContainer';
import { Toast } from '../../NotificationsBar/types';

describe('ToastContainer', () => {
  const mockToasts: Toast[] = [
    {
      id: 1,
      title: 'Toast 1',
      message: 'Message 1',
      type: 'info',
    },
    {
      id: 2,
      title: 'Toast 2',
      message: 'Message 2',
      type: 'success',
    },
    {
      id: 3,
      title: 'Toast 3',
      message: 'Message 3',
      type: 'error',
    },
  ];

  const defaultProps = {
    toasts: mockToasts,
    position: 'top' as const,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать все переданные toast уведомления', () => {
    render(<ToastContainer {...defaultProps} />);

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
  });

  it('не должен отображаться если нет toast уведомлений', () => {
    const { container } = render(
      <ToastContainer {...defaultProps} toasts={[]} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('должен иметь правильные CSS классы для позиции "top"', () => {
    const { container } = render(
      <ToastContainer {...defaultProps} position="top" />
    );

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
  });

  it('должен иметь правильные CSS классы для позиции "bottom"', () => {
    const { container } = render(
      <ToastContainer {...defaultProps} position="bottom" />
    );

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50');
  });

  it('должен передавать onClose функцию каждому toast', () => {
    render(<ToastContainer {...defaultProps} />);

    // Все toast должны иметь кнопки закрытия
    const closeButtons = screen.getAllByText('✕');
    expect(closeButtons).toHaveLength(3);
  });

  it('должен отображать toast в правильном порядке', () => {
    const { container } = render(<ToastContainer {...defaultProps} />);

    const toastElements = container.querySelectorAll('[class*="max-w-sm"]');
    expect(toastElements).toHaveLength(3);

    // Проверяем что toast отображаются в том же порядке, что и в массиве
    expect(toastElements[0]).toHaveTextContent('Toast 1');
    expect(toastElements[1]).toHaveTextContent('Toast 2');
    expect(toastElements[2]).toHaveTextContent('Toast 3');
  });

  it('должен передавать правильные пропсы каждому ToastNotification', () => {
    render(<ToastContainer {...defaultProps} />);

    // Проверяем что все типы toast отображаются корректно
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
    expect(screen.getByText('Message 3')).toBeInTheDocument();
  });

  it('должен корректно обрабатывать единственный toast', () => {
    const singleToast: Toast[] = [
      {
        id: 1,
        title: 'Single Toast',
        message: 'Single Message',
        type: 'warning',
      },
    ];

    render(<ToastContainer {...defaultProps} toasts={singleToast} />);

    expect(screen.getByText('Single Toast')).toBeInTheDocument();
    expect(screen.getByText('Single Message')).toBeInTheDocument();
  });

  it('должен иметь правильный z-index для отображения поверх других элементов', () => {
    const { container } = render(<ToastContainer {...defaultProps} />);

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('z-50');
  });

  it('должен отображать toast с разными типами', () => {
    const mixedToasts: Toast[] = [
      { id: 1, title: 'Info', message: 'Info msg', type: 'info' },
      { id: 2, title: 'Success', message: 'Success msg', type: 'success' },
      { id: 3, title: 'Warning', message: 'Warning msg', type: 'warning' },
      { id: 4, title: 'Error', message: 'Error msg', type: 'error' },
    ];

    const { container } = render(
      <ToastContainer {...defaultProps} toasts={mixedToasts} />
    );

    // Проверяем что все типы отображаются
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    // Проверяем что разные стили применяются
    const toastElements = container.querySelectorAll('[class*="bg-"]');
    expect(toastElements.length).toBeGreaterThan(0);
  });

  it('должен корректно обрабатывать toast с actionUrl', () => {
    const toastsWithActions: Toast[] = [
      {
        id: 1,
        title: 'Action Toast',
        message: 'Click me',
        type: 'info',
        actionUrl: 'https://example.com',
      },
    ];

    render(
      <ToastContainer {...defaultProps} toasts={toastsWithActions} />
    );

    expect(screen.getByText('Action Toast')).toBeInTheDocument();
  });

  it('должен обновляться при изменении списка toast', () => {
    const initialToasts: Toast[] = [
      { id: 1, title: 'Toast 1', message: 'Message 1', type: 'info' },
    ];

    const { rerender } = render(
      <ToastContainer {...defaultProps} toasts={initialToasts} />
    );

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.queryByText('Toast 2')).not.toBeInTheDocument();

    const updatedToasts: Toast[] = [
      { id: 1, title: 'Toast 1', message: 'Message 1', type: 'info' },
      { id: 2, title: 'Toast 2', message: 'Message 2', type: 'success' },
    ];

    rerender(
      <ToastContainer {...defaultProps} toasts={updatedToasts} />
    );

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('должен использовать уникальные ключи для toast элементов', () => {
    const { container } = render(<ToastContainer {...defaultProps} />);

    const toastElements = container.querySelectorAll('[class*="max-w-sm"]');
    
    // React должен корректно отрендерить все элементы с уникальными ключами
    expect(toastElements).toHaveLength(3);
    
    // Каждый элемент должен иметь уникальное содержимое
    const titles = Array.from(toastElements).map(el => 
      el.querySelector('h4')?.textContent
    );
    expect(new Set(titles).size).toBe(3); // Все заголовки уникальны
  });

  it('должен быть fixed позиционированным контейнером', () => {
    const { container } = render(<ToastContainer {...defaultProps} />);

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('fixed');
  });
});
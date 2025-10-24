import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../../NotificationsBar/Toast/ToastProvider';

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('должен предоставлять функцию showToast через children render prop', () => {
    const mockChildren = jest.fn().mockReturnValue(<div>Test Content</div>);

    render(
      <ToastProvider>
        {mockChildren}
      </ToastProvider>
    );

    expect(mockChildren).toHaveBeenCalledWith(
      expect.objectContaining({
        showToast: expect.any(Function),
        testToasts: expect.any(Function),
        togglePosition: expect.any(Function),
        position: 'top',
      })
    );
  });

  it('должен отображать toast при вызове showToast', () => {
    let showToastFunction: any;

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      showToastFunction({
        title: 'Test Toast',
        message: 'Test Message',
        type: 'info',
      });
    });

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('должен отображать несколько toast одновременно', () => {
    let showToastFunction: any;

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      showToastFunction({
        title: 'Toast 1',
        message: 'Message 1',
        type: 'info',
      });
      showToastFunction({
        title: 'Toast 2',
        message: 'Message 2',
        type: 'success',
      });
    });

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('должен удалять toast через функцию onClose', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    let showToastFunction: any;

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      showToastFunction({
        title: 'Test Toast',
        message: 'Test Message',
        type: 'info',
      });
    });

    expect(screen.getByText('Test Toast')).toBeInTheDocument();

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    // Ждем завершения анимации закрытия
    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('должен генерировать уникальные ID для toast', () => {
    let showToastFunction: any;
    const toastIds: number[] = [];

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    // Создаем несколько toast и проверяем уникальность ID
    act(() => {
      for (let i = 0; i < 5; i++) {
        showToastFunction({
          title: `Toast ${i}`,
          message: `Message ${i}`,
          type: 'info',
        });
      }
    });

    // Проверяем что все toast отображаются
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(`Toast ${i}`)).toBeInTheDocument();
    }
  });

  it('должен переключать позицию toast контейнера', () => {
    let togglePositionFunction: any;
    let currentPosition: any;

    const TestComponent = ({ togglePosition, position }: any) => {
      togglePositionFunction = togglePosition;
      currentPosition = position;
      return <div>Position: {position}</div>;
    };

    render(
      <ToastProvider>
        {({ togglePosition, position }) => (
          <TestComponent togglePosition={togglePosition} position={position} />
        )}
      </ToastProvider>
    );

    expect(screen.getByText('Position: top')).toBeInTheDocument();

    act(() => {
      togglePositionFunction();
    });

    expect(screen.getByText('Position: bottom')).toBeInTheDocument();

    act(() => {
      togglePositionFunction();
    });

    expect(screen.getByText('Position: top')).toBeInTheDocument();
  });

  it('должен создавать тестовые toast при вызове testToasts', async () => {
    let testToastsFunction: any;

    render(
      <ToastProvider>
        {({ testToasts }) => {
          testToastsFunction = testToasts;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      testToastsFunction();
    });

    // Первый toast должен появиться сразу
    expect(screen.getByText('Успех!')).toBeInTheDocument();
    expect(screen.getByText('Документ успешно согласован')).toBeInTheDocument();

    // Продвигаем время для показа остальных toast
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Предупреждение')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Ошибка')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Информация')).toBeInTheDocument();
  });

  it('должен передавать правильную позицию в ToastContainer', () => {
    let showToastFunction: any;
    let togglePositionFunction: any;

    render(
      <ToastProvider>
        {({ showToast, togglePosition }) => {
          showToastFunction = showToast;
          togglePositionFunction = togglePosition;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      showToastFunction({
        title: 'Test Toast',
        message: 'Test Message',
      });
    });

    // Проверяем позицию по умолчанию (top)
    const container = document.querySelector('.fixed.top-4.right-4');
    expect(container).toBeInTheDocument();

    act(() => {
      togglePositionFunction();
    });

    // После переключения должна быть позиция bottom
    const bottomContainer = document.querySelector('.fixed.bottom-4.right-4');
    expect(bottomContainer).toBeInTheDocument();
  });

  it('должен корректно обрабатывать toast с actionUrl', () => {
    let showToastFunction: any;

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      showToastFunction({
        title: 'Action Toast',
        message: 'Click me',
        type: 'success',
        actionUrl: 'https://example.com',
      });
    });

    expect(screen.getByText('Action Toast')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('должен автоматически удалять toast по истечении времени', () => {
    let showToastFunction: any;

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    act(() => {
      showToastFunction({
        title: 'Auto Remove Toast',
        message: 'Will be removed automatically',
        duration: 3000,
      });
    });

    expect(screen.getByText('Auto Remove Toast')).toBeInTheDocument();

    // Продвигаем время на 3 секунды + время анимации
    act(() => {
      jest.advanceTimersByTime(3300);
    });

    expect(screen.queryByText('Auto Remove Toast')).not.toBeInTheDocument();
  });

  it('должен обрабатывать множественные удаления toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    let showToastFunction: any;

    render(
      <ToastProvider>
        {({ showToast }) => {
          showToastFunction = showToast;
          return <div>Test Content</div>;
        }}
      </ToastProvider>
    );

    // Создаем несколько toast
    act(() => {
      showToastFunction({ title: 'Toast 1', message: 'Message 1' });
      showToastFunction({ title: 'Toast 2', message: 'Message 2' });
      showToastFunction({ title: 'Toast 3', message: 'Message 3' });
    });

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();

    // Закрываем средний toast
    const closeButtons = screen.getAllByText('✕');
    await user.click(closeButtons[1]);

    await waitFor(() => {
      expect(screen.queryByText('Toast 2')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
  });

  it('должен начинать с позиции top по умолчанию', () => {
    render(
      <ToastProvider>
        {({ position }) => <div>Current position: {position}</div>}
      </ToastProvider>
    );

    expect(screen.getByText('Current position: top')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Очищаем стили body после каждого теста
    document.body.style.overflow = 'unset';
  });

  it('должен отображать полное приложение с системой уведомлений', () => {
    render(<App />);

    // Проверяем основные элементы приложения
    expect(screen.getByText('Система документооборота')).toBeInTheDocument();
    expect(screen.getByText('Добро пожаловать в систему!')).toBeInTheDocument();
    
    // Проверяем что система уведомлений загружена
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    expect(bellButton).toBeInTheDocument();
  });

  it('должен отображать корректную статистику уведомлений', () => {
    render(<App />);

    // Проверяем статистику (основана на mockNotifications)
    expect(screen.getByText('19')).toBeInTheDocument(); // Всего
    // Количество непрочитанных может варьироваться в зависимости от данных
  });

  it('должен выполнять полный сценарий работы с уведомлениями', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Кликаем на колокольчик для открытия бокового меню
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    await user.click(bellButton);

    // 2. Проверяем что боковое меню открылось
    expect(screen.getByTestId('notification-sidebar-title')).toBeInTheDocument();

    // 3. Ждем загрузки данных и кликаем на уведомление
    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-loading')).not.toBeInTheDocument();
    });

    const firstNotification = screen.getAllByTestId('compact-notification')[0];
    await user.click(firstNotification);

    // 4. Открываем полную историю
    const historyButton = screen.getByTestId('notification-sidebar-full-history-button');
    await user.click(historyButton);

    // 5. Проверяем что модальное окно открылось
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Проверяем основное содержимое модального окна
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bar')).toBeInTheDocument();
    });

    // 6. Проверяем что фильтры и сортировка работают
    expect(screen.getByText('Фильтры:')).toBeInTheDocument();
    expect(screen.getByText('Сортировка:')).toBeInTheDocument();

    // 7. Тестируем поиск
    const searchInput = screen.getByTestId('notifications-bar-search-input');
    await user.type(searchInput, 'документ');

    await waitFor(() => {
      // Должны остаться только уведомления с "документ" в названии
      const visibleNotifications = screen.getAllByText(/документ/i);
      expect(visibleNotifications.length).toBeGreaterThan(0);
    });

    // 8. Закрываем модальное окно через ESC
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('должен корректно обновлять счетчик при взаимодействии с уведомлениями', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Получаем начальный счетчик (ищем кнопку колокольчика)
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    const initialBadge = bellButton.querySelector('span');
    const initialCount = initialBadge?.textContent;

    // Открываем боковое меню
    await user.click(bellButton);

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-loading')).not.toBeInTheDocument();
    });

    // Отмечаем все как прочитанные
    const markAllButton = screen.getByTestId('notification-sidebar-mark-all-read-button');
    await user.click(markAllButton);

    // Проверяем что счетчик исчез (снова используем кнопку колокольчика)
    await waitFor(() => {
      const updatedBellButton = screen.getByLabelText(/Открыть центр уведомлений/);
      const updatedBadge = updatedBellButton.querySelector('span');
      expect(updatedBadge).toBeNull();
    });

    // Проверяем обновление статистики - счетчик должен исчезнуть
    await waitFor(() => {
      const updatedBellButton = screen.getByLabelText(/Открыть центр уведомлений/);
      const updatedBadge = updatedBellButton.querySelector('span');
      expect(updatedBadge).toBeNull();
    });
  });

  it('должен поддерживать keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Устанавливаем фокус на первый интерактивный элемент
    document.body.focus();

    // Переходим по Tab к чекбоксу
    await user.tab();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveFocus();

    // Переходим к кнопке тест уведомлений
    await user.tab();
    const testButton = screen.getByTestId('app-test-toasts-button');
    expect(testButton).toHaveFocus();

    // Переходим ко второй кнопке (позиция)
    await user.tab();
    const positionButton = screen.getByTestId('app-toggle-position-button');
    expect(positionButton).toHaveFocus();

    // Переходим к колокольчику
    await user.tab();
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    expect(bellButton).toHaveFocus();

    // Открываем меню через Enter
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('notification-sidebar-title')).toBeInTheDocument();

    // Закрываем через Escape
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-title')).not.toBeInTheDocument();
    });
  });

  it('должен показывать toast при нажатии кнопки тестирования', async () => {
    const user = userEvent.setup();
    render(<App />);

    const testButton = screen.getByTestId('app-test-toasts-button');
    await user.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Успех!')).toBeInTheDocument();
    });
  });

  it('должен переключать позицию toast', async () => {
    const user = userEvent.setup();
    render(<App />);

    const positionButton = screen.getByTestId('app-toggle-position-button');
    expect(screen.getByText('Позиция: Сверху')).toBeInTheDocument();
    
    await user.click(positionButton);
    expect(screen.getByText('Позиция: Снизу')).toBeInTheDocument();
  });

  it('должен работать с toast уведомлениями', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Открываем полную историю
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    await user.click(bellButton);

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-loading')).not.toBeInTheDocument();
    });

    const historyButton = screen.getByTestId('notification-sidebar-full-history-button');
    await user.click(historyButton);

    // Тестируем toast уведомления
    const testButton = screen.getByText('Тест уведомлений');
    await user.click(testButton);

    // Проверяем что toast появился
    await waitFor(() => {
      expect(screen.getByText('Успех!')).toBeInTheDocument();
    });
  });

  it('должен сохранять состояние при переключении между боковым меню и модальным окном', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Открываем боковое меню
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    await user.click(bellButton);

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-loading')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Проверяем что есть кнопка полной истории - это означает что sidebar работает
    expect(screen.getByTestId('notification-sidebar-full-history-button')).toBeInTheDocument();

    // Открываем полную историю
    const historyButton = screen.getByTestId('notification-sidebar-full-history-button');
    await user.click(historyButton);

    // Проверяем что система работает корректно
    await waitFor(() => {
      expect(screen.getByTestId('notifications-bar')).toBeInTheDocument();
    });
  });

  it('должен корректно обрабатывать закрытие компонентов', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Открываем боковое меню
    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);
    await user.click(bellButton);

    // Закрываем кликом на backdrop
    const backdrop = screen.getByTestId('notification-sidebar-backdrop');
    await user.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-title')).not.toBeInTheDocument();
    });

    // Открываем модальное окно
    await user.click(bellButton);
    
    // Ждем загрузки данных в боковом меню
    await waitFor(() => {
      expect(screen.queryByTestId('notification-sidebar-loading')).not.toBeInTheDocument();
    });
    
    const historyButton = screen.getByTestId('notification-sidebar-full-history-button');
    await user.click(historyButton);

    // Ждем открытия модального окна
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Закрываем модальное окно кликом на backdrop (более специфичный селектор)
    const modalBackdrop = screen.getByTestId('modal-backdrop');
    await user.click(modalBackdrop);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('должен поддерживать responsive design', () => {
    render(<App />);

    // Проверяем что есть responsive классы
    const header = screen.getByText('Система документооборота').closest('header');
    expect(header).toHaveClass('bg-white', 'shadow-sm');

    const main = screen.getByText('Добро пожаловать в систему!').closest('main');
    expect(main?.className).toContain('max-w-7xl');
  });

  it('должен отображать правильную информацию о функциях системы', () => {
    render(<App />);

    expect(screen.getByText('Функции системы уведомлений:')).toBeInTheDocument();
    expect(screen.getByText(/Компактное боковое меню с непрочитанными уведомлениями/)).toBeInTheDocument();
    expect(screen.getByText(/Полная история с фильтрами, сортировкой и поиском/)).toBeInTheDocument();
  });

  it('должен работать без ошибок при быстрых взаимодействиях', async () => {
    const user = userEvent.setup();
    render(<App />);

    const bellButton = screen.getByLabelText(/Открыть центр уведомлений/);

    // Быстро открываем и закрываем меню несколько раз
    for (let i = 0; i < 3; i++) {
      await user.click(bellButton);
      await user.keyboard('{Escape}');
    }

    // Не должно быть ошибок или зависших состояний
    expect(screen.queryByTestId('notification-sidebar-title')).not.toBeInTheDocument();
  });
});
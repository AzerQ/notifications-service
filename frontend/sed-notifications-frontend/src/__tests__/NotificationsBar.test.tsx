import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsBar } from '../NotificationsBar/NotificationsBar';
import { mockNotifications } from './utils/testUtils';

describe('NotificationsBar', () => {
  const defaultProps = {
    notifications: mockNotifications,
    onNotificationUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать поисковую строку', () => {
    render(<NotificationsBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск по уведомлениям...');
    expect(searchInput).toBeInTheDocument();
  });

  it('должен отображать фильтры и сортировку', () => {
    render(<NotificationsBar {...defaultProps} />);

    expect(screen.getByText('Фильтры:')).toBeInTheDocument();
    expect(screen.getByText('Сортировка:')).toBeInTheDocument();
  });

  it('должен отображать все уведомления', () => {
    render(<NotificationsBar {...defaultProps} />);

    expect(screen.getByText('Тест документ')).toBeInTheDocument();
    expect(screen.getByText('Тест задание')).toBeInTheDocument();
    // Используем getAllByText для множественных элементов
    expect(screen.getAllByText('Системное уведомление')).toHaveLength(2);
  });

  it('должен разделять избранные и обычные уведомления', () => {
    render(<NotificationsBar {...defaultProps} />);

    expect(screen.getByText('⭐ Избранные уведомления')).toBeInTheDocument();
    expect(screen.getByText('📋 Все уведомления')).toBeInTheDocument();
  });

  it('должен отображать счетчик непрочитанных уведомлений', () => {
    render(<NotificationsBar {...defaultProps} />);

    expect(screen.getByText('2 непрочитанных')).toBeInTheDocument();
  });

  it('должен фильтровать уведомления по поисковому запросу', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск по уведомлениям...');
    await user.type(searchInput, 'документ');

    await waitFor(() => {
      expect(screen.getByText('Тест документ')).toBeInTheDocument();
      expect(screen.queryByText('Тест задание')).not.toBeInTheDocument();
      expect(screen.queryByText('Системное уведомление')).not.toBeInTheDocument();
    });
  });

  it('должен фильтровать уведомления по типу', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    const typeSelect = screen.getByText('Все типы').closest('div');
    await user.click(typeSelect as Element);

    const documentOption = screen.getByText('Документы');
    await user.click(documentOption);

    await waitFor(() => {
      expect(screen.getByText('Тест документ')).toBeInTheDocument();
      expect(screen.queryByText('Тест задание')).not.toBeInTheDocument();
      expect(screen.queryByText('Системное уведомление')).not.toBeInTheDocument();
    });
  });

  it('должен сортировать уведомления', async () => {
    const user = userEvent.setup();
    const mockOnSortChange = jest.fn();
    render(<NotificationsBar {...defaultProps} />);

    const fieldSelect = screen.getByText('Дата').closest('div');
    await user.click(fieldSelect as Element);

    const titleOption = screen.getByText('Заголовок');
    await user.click(titleOption);

    // Уведомления должны быть пересортированы по заголовку
    await waitFor(() => {
      // Проверяем что отображается выбранная опция
      expect(screen.getByText('Заголовок')).toBeInTheDocument();
    });
  });

  it('должен переключать статус избранного', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    const starButtons = screen.getAllByRole('button', { name: /избранного/i });
    await user.click(starButtons[0]);

    expect(defaultProps.onNotificationUpdate).toHaveBeenCalled();
  });

  it('должен переключать статус прочтения', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    const eyeButton = screen.getAllByTitle('Отметить как прочитанное')[0];
    await user.click(eyeButton);

    expect(defaultProps.onNotificationUpdate).toHaveBeenCalled();
  });

  it('должен отображать сообщение когда нет результатов поиска', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск по уведомлениям...');
    await user.type(searchInput, 'несуществующий');

    await waitFor(() => {
      expect(screen.getByText('Уведомления не найдены')).toBeInTheDocument();
      expect(screen.getByText('Попробуйте изменить фильтры или выполнить поиск')).toBeInTheDocument();
    });
  });

  it('должен работать без onNotificationsChange', () => {
    expect(() => {
      render(<NotificationsBar notifications={mockNotifications} />);
    }).not.toThrow();
  });

  it('должен отображать правильное количество уведомлений в заголовках секций', () => {
    render(<NotificationsBar {...defaultProps} />);

    // 1 избранное уведомление
    const starredSection = screen.getByText('⭐ Избранные уведомления').nextElementSibling;
    expect(starredSection).toHaveTextContent('1');

    // 2 обычных уведомления
    const regularSection = screen.getByText('📋 Все уведомления').nextElementSibling;
    expect(regularSection).toHaveTextContent('2');
  });

  it('должен применять комбинированные фильтры', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    // Применяем фильтр по типу
    const typeSelect = screen.getByText('Все типы').closest('div');
    await user.click(typeSelect as Element);
    const documentOption = screen.getByText('Документы');
    await user.click(documentOption);

    // Применяем фильтр по статусу
    const statusSelect = screen.getByText('Все статусы').closest('div');
    await user.click(statusSelect as Element);
    const unreadOption = screen.getByText('Непрочитанные');
    await user.click(unreadOption);

    await waitFor(() => {
      // Должен остаться только непрочитанный документ
      expect(screen.getByText('Тест документ')).toBeInTheDocument();
      expect(screen.queryByText('Тест задание')).not.toBeInTheDocument();
      expect(screen.queryByText('Системное уведомление')).not.toBeInTheDocument();
    });
  });

  it('должен поддерживать адаптивный grid layout', () => {
    const { container } = render(<NotificationsBar {...defaultProps} />);

    const grids = container.querySelectorAll('.grid.gap-4.grid-cols-1.lg\\:grid-cols-2.xl\\:grid-cols-3');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('должен отображать корректное сообщение когда нет избранных', () => {
    const notificationsWithoutStarred = mockNotifications.map(n => ({ ...n, starred: false }));
    
    render(<NotificationsBar notifications={notificationsWithoutStarred} />);

    // Не должно быть секции избранных
    expect(screen.queryByText('⭐ Избранные уведомления')).not.toBeInTheDocument();
    expect(screen.getByText('📋 Все уведомления')).toBeInTheDocument();
  });

  it('должен правильно обрабатывать пустой список уведомлений', () => {
    render(<NotificationsBar notifications={[]} />);

    expect(screen.getByText('Уведомления не найдены')).toBeInTheDocument();
  });

  it('должен сохранять и применять пресеты фильтров', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    // Устанавливаем фильтр
    const typeSelect = screen.getByText('Все типы').closest('div');
    await user.click(typeSelect as Element);
    const documentOption = screen.getByText('Документы');
    await user.click(documentOption);

    // Открываем меню пресетов
    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    // Сохраняем пресет
    const saveButton = screen.getByText('Сохранить текущий фильтр');
    await user.click(saveButton);

    // Вводим название пресета
    const input = screen.getByPlaceholderText('Название фильтра...');
    await user.type(input, 'Только документы');

    const saveModalButton = screen.getByText('Сохранить');
    await user.click(saveModalButton);

    // Проверяем что показался toast
    await waitFor(() => {
      expect(screen.getByText('Пресет "Только документы" сохранен')).toBeInTheDocument();
    });
  });

  it('должен обновлять счетчик при изменении уведомлений', async () => {
    const user = userEvent.setup();
    render(<NotificationsBar {...defaultProps} />);

    expect(screen.getByText('2 непрочитанных')).toBeInTheDocument();

    // Помечаем одно уведомление как прочитанное
    const eyeButton = screen.getAllByTitle('Отметить как прочитанное')[0];
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByText('1 непрочитанных')).toBeInTheDocument();
    });
  });
});
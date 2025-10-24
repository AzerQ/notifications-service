import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationFilters } from '../NotificationsBar/NotificationFilters';
import { mockNotifications } from './utils/testUtils';
import { Filters, Preset } from '../NotificationsBar/types';

describe('NotificationFilters', () => {
  const defaultFilters: Filters = {
    type: '',
    subtype: '',
    status: '',
    author: '',
  };

  const defaultProps = {
    notifications: mockNotifications,
    filters: defaultFilters,
    onFilterChange: jest.fn(),
    onSavePreset: jest.fn(),
    presets: [],
    onApplyPreset: jest.fn(),
    isModalOpen: false,
    onModalOpen: jest.fn(),
    onModalClose: jest.fn(),
    onModalSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать все фильтры', () => {
    render(<NotificationFilters {...defaultProps} />);

    expect(screen.getByText('Фильтры:')).toBeInTheDocument();
    expect(screen.getByText('Тип')).toBeInTheDocument();
    expect(screen.getByText('Подтип')).toBeInTheDocument();
    expect(screen.getByText('Статус')).toBeInTheDocument();
    expect(screen.getByText('Автор')).toBeInTheDocument();
  });

  it('должен вызывать onFilterChange при изменении типа', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const typeSelect = screen.getByText('Все типы').closest('div');
    await user.click(typeSelect as Element);

    const documentOption = screen.getByText('Документы');
    await user.click(documentOption);

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('type', 'document');
  });

  it('должен вызывать onFilterChange при изменении статуса', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const statusSelect = screen.getByText('Все статусы').closest('div');
    await user.click(statusSelect as Element);

    const unreadOption = screen.getByText('Непрочитанные');
    await user.click(unreadOption);

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('status', 'unread');
  });

  it('должен отображать выпадающее меню пресетов при клике', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    expect(screen.getByText('Сохранить текущий фильтр')).toBeInTheDocument();
  });

  it('должен отображать существующие пресеты', async () => {
    const user = userEvent.setup();
    const presets: Preset[] = [
      {
        name: 'Тестовый пресет',
        filters: { ...defaultFilters, type: 'document', search: '' },
      },
    ];

    render(<NotificationFilters {...defaultProps} presets={presets} />);

    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    expect(screen.getByText('Тестовый пресет')).toBeInTheDocument();
  });

  it('должен вызывать onApplyPreset при клике на пресет', async () => {
    const user = userEvent.setup();
    const preset: Preset = {
      name: 'Тестовый пресет',
      filters: { ...defaultFilters, type: 'document', search: '' },
    };

    render(<NotificationFilters {...defaultProps} presets={[preset]} />);

    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    const presetOption = screen.getByText('Тестовый пресет');
    await user.click(presetOption);

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(preset);
  });

  it('должен закрывать меню пресетов после выбора пресета', async () => {
    const user = userEvent.setup();
    const preset: Preset = {
      name: 'Тестовый пресет',
      filters: { ...defaultFilters, type: 'document', search: '' },
    };

    render(<NotificationFilters {...defaultProps} presets={[preset]} />);

    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    const presetOption = screen.getByText('Тестовый пресет');
    await user.click(presetOption);

    await waitFor(() => {
      expect(screen.queryByText('Сохранить текущий фильтр')).not.toBeInTheDocument();
    });
  });

  it('должен открывать модальное окно сохранения пресета', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    const saveButton = screen.getByText('Сохранить текущий фильтр');
    await user.click(saveButton);

    expect(defaultProps.onModalOpen).toHaveBeenCalled();
  });

  it('должен отображать модальное окно когда isModalOpen=true', () => {
    render(<NotificationFilters {...defaultProps} isModalOpen={true} />);

    expect(screen.getByText('Сохранить пресет фильтра')).toBeInTheDocument();
  });

  it('должен поворачивать стрелку при открытии меню пресетов', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const presetsButton = screen.getByText('Пресеты');
    // Находим иконку chevron в кнопке пресетов
    const chevronIcon = presetsButton.parentElement?.querySelector('svg');

    expect(chevronIcon).not.toHaveClass('rotate-180');

    await user.click(presetsButton);

    expect(chevronIcon).toHaveClass('rotate-180');
  });

  it('должен генерировать опции подтипов из уведомлений', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const subtypeSelect = screen.getByText('Все подвиды').closest('div');
    await user.click(subtypeSelect as Element);

    // Проверяем что подтипы из mockNotifications присутствуют
    expect(screen.getByText('Входящий документ')).toBeInTheDocument();
    expect(screen.getByText('Задание на согласование')).toBeInTheDocument();
    expect(screen.getByText('Системное уведомление')).toBeInTheDocument();
  });

  it('должен генерировать опции авторов из уведомлений', async () => {
    const user = userEvent.setup();
    render(<NotificationFilters {...defaultProps} />);

    const authorSelect = screen.getByText('Все авторы').closest('div');
    await user.click(authorSelect as Element);

    // Проверяем что авторы из mockNotifications присутствуют
    expect(screen.getByText('Тест Автор')).toBeInTheDocument();
    expect(screen.getByText('Другой Автор')).toBeInTheDocument();
    expect(screen.getByText('Система')).toBeInTheDocument();
  });

  it('должен отображать текущие значения фильтров', () => {
    const filters: Filters = {
      type: 'document',
      subtype: 'Входящий документ',
      status: 'unread',
      author: 'Тест Автор',
    };

    render(<NotificationFilters {...defaultProps} filters={filters} />);

    expect(screen.getByText('Документы')).toBeInTheDocument();
    expect(screen.getByText('Входящий документ')).toBeInTheDocument();
    expect(screen.getByText('Непрочитанные')).toBeInTheDocument();
    expect(screen.getByText('Тест Автор')).toBeInTheDocument();
  });

  it('должен иметь правильные минимальные ширины для селектов', () => {
    const { container } = render(<NotificationFilters {...defaultProps} />);

    const selects = container.querySelectorAll('.min-w-\\[150px\\]');
    expect(selects).toHaveLength(3); // type, status, author

    const subtypeSelect = container.querySelector('.min-w-\\[180px\\]');
    expect(subtypeSelect).toBeInTheDocument();
  });

  it('должен сохранять состояние меню пресетов при клике вне его', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <NotificationFilters {...defaultProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const presetsButton = screen.getByText('Пресеты');
    await user.click(presetsButton);

    expect(screen.getByText('Сохранить текущий фильтр')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    // Меню остается открытым, так как закрытие по клику вне не реализовано
    expect(screen.getByText('Сохранить текущий фильтр')).toBeInTheDocument();
  });
});
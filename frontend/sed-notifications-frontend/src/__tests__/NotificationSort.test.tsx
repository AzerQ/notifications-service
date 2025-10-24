import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationSort } from '../NotificationsBar/NotificationSort';
import { SortOption } from '../NotificationsBar/types';

describe('NotificationSort', () => {
  const defaultSortOption: SortOption = {
    field: 'date',
    order: 'desc',
  };

  const defaultProps = {
    sortOption: defaultSortOption,
    onSortChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать компонент сортировки', () => {
    render(<NotificationSort {...defaultProps} />);

    expect(screen.getByText('Сортировка:')).toBeInTheDocument();
    expect(screen.getByText('Поле')).toBeInTheDocument();
    expect(screen.getByText('Порядок')).toBeInTheDocument();
  });

  it('должен отображать иконку сортировки', () => {
    const { container } = render(<NotificationSort {...defaultProps} />);

    const sortIcon = container.querySelector('svg');
    expect(sortIcon).toBeInTheDocument();
  });

  it('должен отображать текущие значения сортировки', () => {
    render(<NotificationSort {...defaultProps} />);

    expect(screen.getByText('Дата')).toBeInTheDocument();
    expect(screen.getByText('По убыванию')).toBeInTheDocument();
  });

  it('должен предоставлять все опции для поля сортировки', async () => {
    const user = userEvent.setup();
    render(<NotificationSort {...defaultProps} />);

    const fieldSelect = screen.getByText('Дата').closest('div');
    await user.click(fieldSelect as Element);

    expect(screen.getAllByText('Дата')[0]).toBeInTheDocument();
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
    expect(screen.getByText('Автор')).toBeInTheDocument();
    expect(screen.getByText('Тип')).toBeInTheDocument();
  });

  it('должен предоставлять все опции для порядка сортировки', async () => {
    const user = userEvent.setup();
    render(<NotificationSort {...defaultProps} />);

    const orderSelect = screen.getByText('По убыванию').closest('div');
    await user.click(orderSelect as Element);

    expect(screen.getAllByText('По убыванию')[0]).toBeInTheDocument();
    expect(screen.getByText('По возрастанию')).toBeInTheDocument();
  });

  it('должен вызывать onSortChange при изменении поля сортировки', async () => {
    const user = userEvent.setup();
    render(<NotificationSort {...defaultProps} />);

    const fieldSelect = screen.getByText('Дата').closest('div');
    await user.click(fieldSelect as Element);

    const titleOption = screen.getByText('Заголовок');
    await user.click(titleOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith({
      field: 'title',
      order: 'desc',
    });
  });

  it('должен вызывать onSortChange при изменении порядка сортировки', async () => {
    const user = userEvent.setup();
    render(<NotificationSort {...defaultProps} />);

    const orderSelect = screen.getByText('По убыванию').closest('div');
    await user.click(orderSelect as Element);

    const ascOption = screen.getByText('По возрастанию');
    await user.click(ascOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith({
      field: 'date',
      order: 'asc',
    });
  });

  it('должен сохранять текущий порядок при изменении поля', async () => {
    const user = userEvent.setup();
    const sortOption: SortOption = {
      field: 'date',
      order: 'asc',
    };

    render(<NotificationSort {...defaultProps} sortOption={sortOption} />);

    const fieldSelect = screen.getByText('Дата').closest('div');
    await user.click(fieldSelect as Element);

    const authorOption = screen.getByText('Автор');
    await user.click(authorOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith({
      field: 'author',
      order: 'asc',
    });
  });

  it('должен сохранять текущее поле при изменении порядка', async () => {
    const user = userEvent.setup();
    const sortOption: SortOption = {
      field: 'title',
      order: 'desc',
    };

    render(<NotificationSort {...defaultProps} sortOption={sortOption} />);

    const orderSelect = screen.getByText('По убыванию').closest('div');
    await user.click(orderSelect as Element);

    const ascOption = screen.getByText('По возрастанию');
    await user.click(ascOption);

    expect(defaultProps.onSortChange).toHaveBeenCalledWith({
      field: 'title',
      order: 'asc',
    });
  });

  it('должен отображать разные варианты полей сортировки', async () => {
    const user = userEvent.setup();
    
    render(<NotificationSort {...defaultProps} />);

    const fieldSelect = screen.getByText('Дата').closest('div');
    await user.click(fieldSelect as Element);

    // Проверяем все варианты полей в выпадающем списке
    const dropdown = document.querySelector('.absolute');
    expect(dropdown).toBeInTheDocument();
    
    const options = dropdown?.querySelectorAll('div[class*="px-3 py-2"]');
    expect(options).toHaveLength(4);
    
    const optionTexts = Array.from(options || []).map(el => el.textContent);
    expect(optionTexts).toEqual(['Дата', 'Заголовок', 'Автор', 'Тип']);
  });

  it('должен отображать корректные варианты порядка сортировки', async () => {
    const user = userEvent.setup();
    render(<NotificationSort {...defaultProps} />);

    const orderSelect = screen.getByText('По убыванию').closest('div');
    await user.click(orderSelect as Element);

    // Проверяем все варианты порядка в выпадающем списке
    await waitFor(() => {
      const dropdown = document.querySelector('.absolute.z-10:last-child');
      const options = dropdown?.querySelectorAll('div[class*="px-3 py-2"]');
      expect(options).toHaveLength(2);
      
      const optionTexts = Array.from(options || []).map(el => el.textContent);
      expect(optionTexts).toEqual(['По убыванию', 'По возрастанию']);
    });
  });

  it('должен иметь правильные минимальные ширины для селектов', () => {
    const { container } = render(<NotificationSort {...defaultProps} />);

    const selects = container.querySelectorAll('.min-w-\\[150px\\]');
    expect(selects).toHaveLength(2); // field и order selects
  });

  it('должен иметь правильную структуру layout', () => {
    const { container } = render(<NotificationSort {...defaultProps} />);

    const sortContainer = container.querySelector('.bg-white.rounded-lg.border.p-4.mb-6');
    expect(sortContainer).toBeInTheDocument();

    const flexContainer = container.querySelector('.flex.flex-wrap.items-center.gap-4');
    expect(flexContainer).toBeInTheDocument();
  });

  it('должен показывать подписи для селектов', () => {
    render(<NotificationSort {...defaultProps} />);

    const fieldLabel = screen.getByText('Поле');
    expect(fieldLabel).toBeInTheDocument();
    expect(fieldLabel).toHaveClass('text-xs', 'text-gray-500', 'mb-1');

    const orderLabel = screen.getByText('Порядок');
    expect(orderLabel).toBeInTheDocument();
    expect(orderLabel).toHaveClass('text-xs', 'text-gray-500', 'mb-1');
  });

  it('должен корректно работать с TypeScript типами', () => {
    // Проверяем что компонент принимает правильные типы
    const validSortOption: SortOption = {
      field: 'date',
      order: 'asc',
    };

    const validProps = {
      sortOption: validSortOption,
      onSortChange: (option: SortOption) => {
        expect(option.field).toBeDefined();
        expect(option.order).toBeDefined();
      },
    };

    render(<NotificationSort {...validProps} />);
  });
});
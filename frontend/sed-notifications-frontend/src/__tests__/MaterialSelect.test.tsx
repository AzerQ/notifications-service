import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaterialSelect } from '../NotificationsBar/MaterialSelect';

describe('MaterialSelect', () => {
  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    options: defaultOptions,
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать placeholder когда значение не выбрано', () => {
    render(<MaterialSelect {...defaultProps} placeholder="Выберите опцию" />);
    
    expect(screen.getByText('Выберите опцию')).toBeInTheDocument();
  });

  it('должен отображать выбранное значение', () => {
    render(<MaterialSelect {...defaultProps} value="option2" />);
    
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('должен открывать выпадающий список при клике', async () => {
    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('должен закрывать выпадающий список при клике вне его', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <MaterialSelect {...defaultProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    // Проверяем что выпадающий список открыт
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Кликаем вне селекта
    const outside = screen.getByTestId('outside');
    await user.click(outside);
    
    // Проверяем что выпадающий список закрыт
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('должен вызывать onChange при выборе опции', async () => {
    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    const option = screen.getByText('Option 2');
    await user.click(option);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('option2');
  });

  it('должен закрывать выпадающий список после выбора опции', async () => {
    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    const option = screen.getByText('Option 2');
    await user.click(option);
    
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('должен выделять выбранную опцию в выпадающем списке', async () => {
    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} value="option2" />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    // Находим опцию в выпадающем списке (не в заголовке select)
    const dropdownOptions = screen.getAllByText('Option 2');
    const selectedOption = dropdownOptions.find(option => 
      option.closest('.absolute') // ищем элемент в выпадающем списке
    );
    expect(selectedOption).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('должен быть отключен когда disabled=true', () => {
    render(<MaterialSelect {...defaultProps} disabled={true} />);
    
    const select = screen.getByRole('button');
    expect(select).toHaveClass('cursor-not-allowed', 'bg-gray-100');
  });

  it('не должен открывать выпадающий список когда отключен', async () => {
    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} disabled={true} />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('должен применять пользовательские CSS классы', () => {
    render(<MaterialSelect {...defaultProps} className="custom-class" />);
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('должен показывать иконку стрелки', () => {
    const { container } = render(<MaterialSelect {...defaultProps} />);
    
    const chevronIcon = container.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
  });

  it('должен поворачивать иконку стрелки когда выпадающий список открыт', async () => {
    const user = userEvent.setup();
    const { container } = render(<MaterialSelect {...defaultProps} />);
    
    const select = screen.getByRole('button');
    const chevronIcon = container.querySelector('svg');
    
    // Изначально стрелка не повернута
    expect(chevronIcon).not.toHaveClass('rotate-180');
    
    await user.click(select);
    
    // После открытия стрелка повернута
    expect(chevronIcon).toHaveClass('rotate-180');
  });

  it('должен обрабатывать пустые опции', () => {
    render(<MaterialSelect {...defaultProps} options={[]} />);
    
    const select = screen.getByRole('button');
    expect(select).toBeInTheDocument();
  });

  it('должен корректно обрабатывать hover эффекты', async () => {
    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    const option = screen.getByText('Option 1');
    await user.hover(option);
    
    expect(option).toHaveClass('hover:bg-blue-50');
  });

  it('должен иметь максимальную высоту для длинного списка опций', async () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`,
    }));

    const user = userEvent.setup();
    render(<MaterialSelect {...defaultProps} options={manyOptions} />);
    
    const select = screen.getByRole('button');
    await user.click(select);
    
    const dropdown = screen.getByText('Option 0').parentElement;
    expect(dropdown).toHaveClass('max-h-60', 'overflow-auto');
  });
});
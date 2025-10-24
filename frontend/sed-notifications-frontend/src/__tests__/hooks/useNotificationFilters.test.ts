import { renderHook, act } from '@testing-library/react';
import { useNotificationFilters } from '../../hooks/useNotificationFilters';
import { BaseNotification } from '../../models/Notification';
import { createSimpleFilter } from '../../models/NotificationFilter';

describe('useNotificationFilters', () => {
  const sampleNotifications: BaseNotification[] = [
    {
      id: 1,
      type: 'document',
      title: 'Document 1',
      content: 'Content 1',
      date: '2024-01-15T10:00:00',
      read: false,
      author: 'John Doe',
      hashtags: ['urgent']
    },
    {
      id: 2,
      type: 'task',
      title: 'Task 1',
      content: 'Content 2',
      date: '2024-01-16T10:00:00',
      read: true,
      author: 'Jane Smith'
    },
    {
      id: 3,
      type: 'document',
      title: 'Document 2',
      content: 'Content 3',
      date: '2024-01-17T10:00:00',
      read: false,
      author: 'John Doe',
      hashtags: ['review']
    }
  ];

  it('должен инициализироваться с пустыми фильтрами', () => {
    const { result } = renderHook(() => useNotificationFilters());

    expect(result.current.filters).toEqual([]);
    expect(result.current.searchText).toBe('');
  });

  it('должен инициализироваться с начальными фильтрами', () => {
    const initialFilters = [createSimpleFilter('type', 'equals', 'document')];
    const { result } = renderHook(() =>
      useNotificationFilters({ initialFilters })
    );

    expect(result.current.filters).toEqual(initialFilters);
  });

  it('должен добавлять фильтры', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByType('document');
    });

    expect(result.current.filters).toHaveLength(1);
    expect(result.current.filters[0].conditions[0].field).toBe('type');
  });

  it('должен удалять фильтры по индексу', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByType('document');
      result.current.filterByAuthor('John');
    });

    expect(result.current.filters).toHaveLength(2);

    act(() => {
      result.current.removeFilter(0);
    });

    expect(result.current.filters).toHaveLength(1);
    expect(result.current.filters[0].conditions[0].field).toBe('author');
  });

  it('должен очищать все фильтры', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByType('document');
      result.current.filterByAuthor('John');
      result.current.setSearchText('test');
    });

    expect(result.current.filters).toHaveLength(2);
    expect(result.current.searchText).toBe('test');

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual([]);
    expect(result.current.searchText).toBe('');
  });

  it('должен устанавливать текст поиска', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.setSearchText('search term');
    });

    expect(result.current.searchText).toBe('search term');
  });

  it('должен применять фильтр по типу', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByType('document');
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(n => n.type === 'document')).toBe(true);
  });

  it('должен применять фильтр по автору', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByAuthor('John');
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(n => n.author?.includes('John'))).toBe(true);
  });

  it('должен применять фильтр по хэштегу', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByHashtag('urgent');
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].hashtags).toContain('urgent');
  });

  it('должен применять фильтр по диапазону дат', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByDateRange('2024-01-16T00:00:00', '2024-01-17T12:00:00');
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(2);
  });

  it('должен применять фильтр по статусу прочтения', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByReadStatus(false);
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(n => !n.read)).toBe(true);
  });

  it('должен применять несколько фильтров одновременно', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByType('document');
      result.current.filterByReadStatus(false);
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(n => n.type === 'document' && !n.read)).toBe(true);
  });

  it('должен применять поиск к результатам фильтрации', () => {
    const { result } = renderHook(() => useNotificationFilters());

    act(() => {
      result.current.filterByType('document');
      result.current.setSearchText('Document 2');
    });

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(3);
  });

  it('должен возвращать все уведомления без фильтров', () => {
    const { result } = renderHook(() => useNotificationFilters());

    const filtered = result.current.applyFilters(sampleNotifications);

    expect(filtered).toHaveLength(3);
  });

  it('должен кешировать функцию applyFilters', () => {
    const { result, rerender } = renderHook(() => useNotificationFilters());

    const firstApplyFilters = result.current.applyFilters;
    
    rerender();

    expect(result.current.applyFilters).toBe(firstApplyFilters);
  });

  it('должен обновлять функцию applyFilters при изменении фильтров', () => {
    const { result } = renderHook(() => useNotificationFilters());

    const firstApplyFilters = result.current.applyFilters;

    act(() => {
      result.current.filterByType('document');
    });

    expect(result.current.applyFilters).not.toBe(firstApplyFilters);
  });
});

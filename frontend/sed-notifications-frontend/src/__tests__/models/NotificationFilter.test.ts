import {
  BaseNotification,
  NotificationParameter
} from '../../models/Notification';
import {
  FilterCondition,
  NotificationFilter,
  applyFilter,
  filterNotifications,
  createSimpleFilter,
  filterByType,
  filterByAuthor,
  filterByHashtag,
  filterByDateRange,
  filterByReadStatus,
  searchNotifications
} from '../../models/NotificationFilter';

describe('NotificationFilter', () => {
  const sampleNotifications: BaseNotification[] = [
    {
      id: "1",
      receiverId: "user1",
      type: 'document',
      title: 'Document 1',
      content: 'Content for document 1',
      url: '/documents/1',
      date: '2024-01-15T10:00:00',
      read: false,
      author: 'John Doe',
      hashtags: ['important', 'urgent'],
      parameters: [
        { key: 'priority', value: 'high', description: 'Priority level' }
      ]
    },
    {
      id: "2",
      receiverId: "user1",
      type: 'task',
      title: 'Task 1',
      content: 'Content for task 1',
      url: '/tasks/2',
      date: '2024-01-16T10:00:00',
      read: true,
      author: 'Jane Smith',
      hashtags: ['review', 'project'],
      parameters: [
        { key: 'status', value: 'pending', description: 'Task status' }
      ]
    },
    {
      id: "3",
      receiverId: "user1",
      type: 'document',
      title: 'Document 2',
      content: 'Another document content',
      url: '/documents/3',
      date: '2024-01-17T10:00:00',
      read: false,
      author: 'John Doe',
      hashtags: ['review'],
      parameters: []
    }
  ];

  describe('applyFilter', () => {
    it('должен возвращать true для пустого фильтра', () => {
      const filter: NotificationFilter = { conditions: [] };
      
      sampleNotifications.forEach(notification => {
        expect(applyFilter(notification, filter)).toBe(true);
      });
    });

    it('должен фильтровать по типу с equals', () => {
      const filter: NotificationFilter = {
        conditions: [{ field: 'type', operator: 'equals', value: 'document' }],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(n => n.type === 'document')).toBe(true);
    });

    it('должен фильтровать по автору с contains', () => {
      const filter: NotificationFilter = {
        conditions: [{ field: 'author', operator: 'contains', value: 'john' }],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(n => n.author?.toLowerCase().includes('john'))).toBe(true);
    });

    it('должен фильтровать по дате с greaterThan', () => {
      const filter: NotificationFilter = {
        conditions: [{ field: 'date', operator: 'greaterThan', value: '2024-01-15T12:00:00' }],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
    });

    it('должен фильтровать по дате с lessThan', () => {
      const filter: NotificationFilter = {
        conditions: [{ field: 'date', operator: 'lessThan', value: '2024-01-17T00:00:00' }],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
    });

    it('должен фильтровать с логикой AND', () => {
      const filter: NotificationFilter = {
        conditions: [
          { field: 'type', operator: 'equals', value: 'document' },
          { field: 'read', operator: 'equals', value: false }
        ],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
    });

    it('должен фильтровать с логикой OR', () => {
      const filter: NotificationFilter = {
        conditions: [
          { field: 'type', operator: 'equals', value: 'task' },
          { field: 'read', operator: 'equals', value: true }
        ],
        logic: 'OR'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    it('должен фильтровать по hashtags с contains', () => {
      const filter: NotificationFilter = {
        conditions: [{ field: 'hashtags', operator: 'contains', value: 'review' }],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
    });

    it('должен фильтровать по exists для опциональных полей', () => {
      const filter: NotificationFilter = {
        conditions: [{ field: 'author', operator: 'exists' }],
        logic: 'AND'
      };
      
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('filterNotifications', () => {
    it('должен применять несколько фильтров', () => {
      const filters: NotificationFilter[] = [
        {
          conditions: [{ field: 'type', operator: 'equals', value: 'document' }],
          logic: 'AND'
        },
        {
          conditions: [{ field: 'read', operator: 'equals', value: false }],
          logic: 'AND'
        }
      ];
      
      const filtered = filterNotifications(sampleNotifications, filters);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(n => n.type === 'document' && !n.read)).toBe(true);
    });

    it('должен вернуть все уведомления для пустого массива фильтров', () => {
      const filtered = filterNotifications(sampleNotifications, []);
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Helper functions', () => {
    it('createSimpleFilter должен создать простой фильтр', () => {
      const filter = createSimpleFilter('type', 'equals', 'document');
      
      expect(filter.conditions).toHaveLength(1);
      expect(filter.conditions[0].field).toBe('type');
      expect(filter.conditions[0].operator).toBe('equals');
      expect(filter.conditions[0].value).toBe('document');
      expect(filter.logic).toBe('AND');
    });

    it('filterByType должен создать фильтр по типу', () => {
      const filter = filterByType('task');
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('task');
    });

    it('filterByAuthor должен создать фильтр по автору', () => {
      const filter = filterByAuthor('Jane');
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].author).toBe('Jane Smith');
    });

    it('filterByHashtag должен создать фильтр по хэштегу', () => {
      const filter = filterByHashtag('urgent');
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hashtags).toContain('urgent');
    });

    it('filterByDateRange должен создать фильтр по диапазону дат', () => {
      const filter = filterByDateRange('2024-01-16T00:00:00', '2024-01-17T12:00:00');
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
    });

    it('filterByReadStatus должен создать фильтр по статусу прочтения', () => {
      const filter = filterByReadStatus(false);
      const filtered = sampleNotifications.filter(n => applyFilter(n, filter));
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(n => !n.read)).toBe(true);
    });
  });

  describe('searchNotifications', () => {
    it('должен искать в заголовке', () => {
      const results = searchNotifications(sampleNotifications, 'Task');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Task 1');
    });

    it('должен искать в содержании', () => {
      const results = searchNotifications(sampleNotifications, 'another document');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(3);
    });

    it('должен искать в авторе', () => {
      const results = searchNotifications(sampleNotifications, 'Jane');
      
      expect(results).toHaveLength(1);
      expect(results[0].author).toBe('Jane Smith');
    });

    it('должен искать в хэштегах', () => {
      const results = searchNotifications(sampleNotifications, 'project');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(2);
    });

    it('должен искать в параметрах', () => {
      const results = searchNotifications(sampleNotifications, 'priority');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
    });

    it('должен быть нечувствительным к регистру', () => {
      const results = searchNotifications(sampleNotifications, 'DOCUMENT');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('должен вернуть все для пустого поиска', () => {
      const results = searchNotifications(sampleNotifications, '');
      
      expect(results).toHaveLength(3);
    });

    it('должен вернуть пустой массив если ничего не найдено', () => {
      const results = searchNotifications(sampleNotifications, 'nonexistent');
      
      expect(results).toHaveLength(0);
    });
  });
});

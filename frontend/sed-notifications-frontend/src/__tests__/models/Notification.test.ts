import {
  BaseNotification,
  ExtendedNotification,
  isBaseNotification,
  toBaseNotification,
  toExtendedNotification,
  NotificationParameter
} from '../../models/Notification';

describe('BaseNotification', () => {
  const sampleNotification: BaseNotification = {
    id: "1",
    receiverId: "user1",
    type: 'document',
    title: 'Test Notification',
    content: 'Test content',
    url: '/test/1',
    date: '2024-01-15T10:30:00',
    read: false
  };

  describe('isBaseNotification', () => {
    it('должен вернуть true для валидного BaseNotification', () => {
      expect(isBaseNotification(sampleNotification)).toBe(true);
    });

    it('должен вернуть true для BaseNotification с опциональными полями', () => {
      const notificationWithOptional: BaseNotification = {
        ...sampleNotification,
        author: 'Test Author',
        actions: [{ name: 'test', label: 'Test', url: 'test://action' }],
        hashtags: ['test', 'notification'],
        parameters: [{ key: 'testKey', value: 'testValue', description: 'Test parameter' }]
      };
      
      expect(isBaseNotification(notificationWithOptional)).toBe(true);
    });

    it('должен вернуть false для объекта без обязательных полей', () => {
      const invalidNotification = {
        id: 1,
        title: 'Test'
      };
      
      expect(isBaseNotification(invalidNotification)).toBe(false);
    });

    it('должен вернуть false для null', () => {
      expect(isBaseNotification(null)).toBe(false);
    });

    it('должен вернуть false для undefined', () => {
      expect(isBaseNotification(undefined)).toBe(false);
    });
  });

  describe('toBaseNotification', () => {
    it('должен конвертировать старый формат в новый', () => {
      const oldNotification = {
        id: "1",
        receiverId: "user1",
        type: 'document',
        title: 'Test',
        description: 'Old description',
        url: '/test/1',
        date: '2024-01-15T10:30:00',
        read: false,
        author: 'Test Author',
        actions: []
      };
      
      const result = toBaseNotification(oldNotification);
      
      expect(result.id).toBe(1);
      expect(result.content).toBe('Old description');
      expect(result.author).toBe('Test Author');
    });

    it('должен использовать content если description отсутствует', () => {
      const notification = {
        id: 1,
        type: 'test',
        title: 'Test',
        content: 'Direct content',
        date: '2024-01-15T10:30:00',
        read: false
      };
      
      const result = toBaseNotification(notification);
      
      expect(result.content).toBe('Direct content');
    });

    it('должен сохранить hashtags и parameters', () => {
      const notification = {
        id: "1",
        receiverId: "user1",
        type: 'test',
        title: 'Test',
        description: 'Test',
        url: '/test/1',
        date: '2024-01-15T10:30:00',
        read: false,
        hashtags: ['tag1', 'tag2'],
        parameters: [{ key: 'k1', value: 'v1', description: 'd1' }]
      };
      
      const result = toBaseNotification(notification);
      
      expect(result.hashtags).toEqual(['tag1', 'tag2']);
      expect(result.parameters).toEqual([{ key: 'k1', value: 'v1', description: 'd1' }]);
    });
  });

  describe('toExtendedNotification', () => {
    it('должен добавить alias description для content', () => {
      const result = toExtendedNotification(sampleNotification);
      
      expect(result.description).toBe(sampleNotification.content);
      expect(result.content).toBe(sampleNotification.content);
    });

    it('должен добавить дополнительные поля', () => {
      const additionalFields = {
        starred: true,
        delegate: true,
        subtype: 'Test Subtype'
      };
      
      const result = toExtendedNotification({...sampleNotification, ...additionalFields});
      
      expect(result.starred).toBe(true);
      expect(result.delegate).toBe(true);
      expect(result.subtype).toBe('Test Subtype');
    });
  });

  describe('NotificationParameter', () => {
    it('должен правильно структурировать параметр', () => {
      const param: NotificationParameter = {
        key: 'priority',
        value: 'high',
        description: 'Priority level'
      };
      
      expect(param.key).toBe('priority');
      expect(param.value).toBe('high');
      expect(param.description).toBe('Priority level');
    });
  });
});

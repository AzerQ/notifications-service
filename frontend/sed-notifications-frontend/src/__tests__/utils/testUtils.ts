// Test utilities and mock data
// This file is not a test file, it contains utilities for tests
import { InAppNotificationData } from "../../NotificationsBar";

// Empty test to satisfy Jest requirement
describe('Test utilities', () => {
  it('should provide test utilities', () => {
    expect(true).toBe(true);
  });
});

// Тестовые данные для уведомлений
export const mockNotifications: InAppNotificationData[] = [
  {
    id: "1",
    title: 'Тест документ',
    type: 'document',
    subType: 'Входящий документ',
    content: 'Тестовое описание документа',
    author: 'Тест Автор',
    date: '2024-01-15T10:30:00',
    read: false,
    receiverId: 'user-764',
    url: '/documents/test',
    actions: [
      {
        name: 'approve',
        label: 'Согласовать',
        url: 'appactions://approveDocument?docId=123'
      }
    ]
  },
  {
    id: "2",
    title: 'Тест задание',
    type: 'task',
    subType: 'Задание на согласование',
    content: 'Тестовое описание задания',
    author: 'Другой Автор',
    date: '2024-01-14T09:15:00',
    read: true,
    receiverId: 'user-764',
    url: '/tasks/test',
    actions: []
  },
  {
    id: "3",
    title: 'Системное уведомление',
    type: 'system',
    subType: 'Системное уведомление',
    content: 'Тестовое системное уведомление',
    author: 'Система',
    date: '2024-01-13T18:00:00',
    read: false,
    receiverId: 'user-764',
    url: '/system/test',
    actions: []
  }
];

export const createMockNotification = (overrides: Partial<InAppNotificationData> = {}): InAppNotificationData => ({
  id: Math.floor(Math.random() * 1000).toString(),
  title: 'Mock Notification',
  type: 'document',
  subType: 'Test Type',
  content: overrides.content || 'Mock description',
  author: 'Mock Author',
  date: new Date().toISOString(),
  read: false,
  actions: [],
  receiverId: 'user-764',
  url: overrides.url || '',
  ...overrides,
});

// Хелперы для тестирования
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockToastFunction = () => jest.fn();

export const createMockActionHandlers = () => {
  const handlers = new Map();
  
  return {
    handlers,
    registerHandler: (name: string, handler: Function) => handlers.set(name, handler),
    executeHandler: (name: string, params: any) => {
      const handler = handlers.get(name);
      if (handler) {
        handler(params);
        return [true, name];
      }
      return [false, 'Handler not found'];
    }
  };
};

// Пустой экспорт для того чтобы Jest не считал этот файл тестом
export {};

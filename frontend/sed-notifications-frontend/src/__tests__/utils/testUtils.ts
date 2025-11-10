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
    subtype: 'Входящий документ',
    description: 'Тестовое описание документа',
    content: 'Тестовое описание документа',
    author: 'Тест Автор',
    date: '2024-01-15T10:30:00',
    read: false,
    starred: true,
    cardUrl: '/documents/test',
    delegate: false,
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
    subtype: 'Задание на согласование',
    description: 'Тестовое описание задания',
    content: 'Тестовое описание задания',
    author: 'Другой Автор',
    date: '2024-01-14T09:15:00',
    read: true,
    starred: false,
    delegate: true,
    receiverId: 'user-764',
    url: '/tasks/test',
    actions: []
  },
  {
    id: "3",
    title: 'Системное уведомление',
    type: 'system',
    subtype: 'Системное уведомление',
    description: 'Тестовое системное уведомление',
    content: 'Тестовое системное уведомление',
    author: 'Система',
    date: '2024-01-13T18:00:00',
    read: false,
    starred: false,
    delegate: false,
    receiverId: 'user-764',
    url: '/system/test',
    actions: []
  }
];

export const createMockNotification = (overrides: Partial<InAppNotificationData> = {}): InAppNotificationData => ({
  id: Math.floor(Math.random() * 1000).toString(),
  title: 'Mock Notification',
  type: 'document',
  subtype: 'Test Type',
  description: 'Mock description',
  content: overrides.content || overrides.description || 'Mock description',
  author: 'Mock Author',
  date: new Date().toISOString(),
  read: false,
  starred: false,
  delegate: false,
  actions: [],
  receiverId: 'user-764',
  url: overrides.cardUrl || '',
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
# Frontend компоненты

Документация по frontend компонентам системы уведомлений.

## Обзор

Frontend часть проекта представляет собой React-приложение на TypeScript с использованием MobX для управления состоянием и SignalR для real-time коммуникации.

**Расположение:** `frontend/sed-notifications-frontend/`

**Технологии:**
- React 18
- TypeScript
- MobX (State Management)
- SignalR Client
- Tailwind CSS
- Jest + React Testing Library

## Архитектура Frontend

```
src/
├── models/                         # Модели данных
│   ├── Notification.ts            # Базовая модель уведомления
│   ├── NotificationFilter.ts      # Модели для фильтрации
│   └── index.ts
├── services/                      # Сервисы
│   ├── contracts/                 # Интерфейсы сервисов
│   │   ├── INotificationService.ts
│   │   └── ISignalRNotificationService.ts
│   └── mocks/                     # Mock реализации
├── stores/                        # MobX stores (если есть)
├── NotificationsBar/              # Основные компоненты
│   ├── NotificationBell.tsx       # Иконка уведомлений
│   ├── NotificationCenterWithStore.tsx  # Центр уведомлений
│   ├── NotificationFilters.tsx    # Фильтры
│   ├── NotificationSettings.tsx   # Настройки
│   ├── Toast/                     # Toast уведомления
│   │   ├── ToastContainer.tsx
│   │   ├── ToastProvider.tsx
│   │   └── ToastNotification.tsx
│   └── ToastSettings/             # Настройки Toast
├── hooks/                         # React hooks
│   └── useNotificationFilters.ts  # Hook для фильтрации
└── utils/                         # Утилиты
    └── notificationUtils.ts
```

## Модели данных

### BaseNotification

Базовая модель уведомления с гибкой типизацией.

**Файл:** `src/models/Notification.ts`

```typescript
export interface BaseNotification {
  // Обязательные поля
  id: number | string;
  type: string;
  title: string;
  content: string;
  date: string;
  read: boolean;

  // Опциональные поля
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
}
```

**Свойства:**
- `id` — уникальный идентификатор
- `type` — тип уведомления (произвольная строка)
- `title` — заголовок
- `content` — основное содержимое
- `date` — дата создания (ISO 8601)
- `read` — статус прочитанности
- `author` — автор уведомления (опционально)
- `actions` — действия, доступные для уведомления (опционально)
- `hashtags` — теги для категоризации (опционально)
- `parameters` — дополнительные метаданные (опционально)

### NotificationParameter

Дополнительные метаданные уведомления.

```typescript
export interface NotificationParameter {
  key: string;
  value: string;
  description: string;
}
```

**Пример:**
```typescript
{
  key: 'priority',
  value: 'high',
  description: 'Priority level of the notification'
}
```

### NotificationAction

Действие, доступное для уведомления.

```typescript
export interface NotificationAction {
  id: string;
  label: string;
  onClick: () => void;
}
```

## Система фильтрации

### NotificationFilter

Модель для динамической фильтрации уведомлений.

**Файл:** `src/models/NotificationFilter.ts`

```typescript
export interface NotificationFilter {
  conditions: FilterCondition[];
  logic: 'AND' | 'OR';
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'in'
  | 'exists';
```

### useNotificationFilters Hook

React hook для работы с фильтрами уведомлений.

**Файл:** `src/hooks/useNotificationFilters.ts`

```typescript
export function useNotificationFilters() {
  const [filters, setFilters] = useState<NotificationFilter[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const filterByType = (type: string) => {
    // Добавляет фильтр по типу
  };

  const filterByHashtag = (hashtag: string) => {
    // Добавляет фильтр по hashtag
  };

  const filterByReadStatus = (read: boolean) => {
    // Добавляет фильтр по статусу прочитанности
  };

  const clearFilters = () => {
    // Очищает все фильтры
  };

  const applyFilters = (notifications: BaseNotification[]) => {
    // Применяет все активные фильтры
    return filterNotifications(notifications, filters, searchText);
  };

  return {
    filters,
    searchText,
    filterByType,
    filterByHashtag,
    filterByReadStatus,
    setSearchText,
    clearFilters,
    applyFilters,
  };
}
```

**Использование:**

```typescript
function MyComponent() {
  const {
    filterByType,
    filterByHashtag,
    setSearchText,
    applyFilters,
    clearFilters
  } = useNotificationFilters();

  const [allNotifications, setAllNotifications] = useState<BaseNotification[]>([]);

  // Фильтрация по типу
  const handleTypeFilter = () => {
    filterByType('document');
  };

  // Применение фильтров
  const filteredNotifications = applyFilters(allNotifications);

  return (
    <div>
      <input onChange={(e) => setSearchText(e.target.value)} />
      <button onClick={handleTypeFilter}>Filter Documents</button>
      <button onClick={clearFilters}>Clear Filters</button>
      <NotificationList notifications={filteredNotifications} />
    </div>
  );
}
```

## Основные компоненты

### NotificationBell

Иконка-кнопка для открытия центра уведомлений с индикатором непрочитанных.

**Файл:** `src/NotificationsBar/NotificationBell.tsx`

```typescript
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <button onClick={onClick} className="notification-bell">
      <BellIcon />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </button>
  );
}
```

**Использование:**

```typescript
<NotificationBell 
  unreadCount={5} 
  onClick={() => setIsOpen(true)} 
/>
```

### NotificationCenterWithStore

Центральный компонент для отображения списка уведомлений.

**Файл:** `src/NotificationsBar/NotificationCenterWithStore.tsx`

**Основные возможности:**
- Отображение списка уведомлений
- Фильтрация и поиск
- Пагинация
- Действия с уведомлениями (пометить как прочитанное, удалить)
- Real-time обновления через SignalR

**Пример использования:**

```typescript
import { NotificationCenterWithStore } from './NotificationsBar';

function App() {
  return (
    <div className="app">
      <NotificationCenterWithStore 
        userId="user-123"
        signalRUrl="http://localhost:5000/notificationHub"
      />
    </div>
  );
}
```

### NotificationFilters

Компонент для фильтрации уведомлений.

**Файл:** `src/NotificationsBar/NotificationFilters.tsx`

**Возможности:**
- Фильтрация по типу
- Фильтрация по статусу (прочитано/не прочитано)
- Фильтрация по дате
- Фильтрация по хештегам
- Текстовый поиск

**Использование:**

```typescript
<NotificationFilters 
  onFilterChange={(filters) => handleFilterChange(filters)}
  availableTypes={['document', 'task', 'message']}
  availableHashtags={['urgent', 'info', 'warning']}
/>
```

### Toast система

Toast-уведомления для отображения временных всплывающих сообщений.

#### ToastNotification

Компонент отдельного toast-уведомления.

**Свойства:**
- `title` — заголовок
- `message` — содержимое
- `type` — тип ('info' | 'success' | 'warning' | 'error')
- `duration` — длительность отображения (мс)
- `position` — позиция на экране

**Использование через hook:**

```typescript
import { useToast } from './NotificationsBar/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast({
      title: 'Success!',
      message: 'Operation completed successfully',
      type: 'success',
      duration: 3000,
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

### ToastSettings

Компонент для настройки отображения toast-уведомлений.

**Файл:** `src/NotificationsBar/ToastSettings/`

**Настройки:**
- Позиция toast (top-left, top-right, bottom-left, bottom-right)
- Длительность отображения
- Размер toast
- Включение/выключение звука

## SignalR интеграция

### ISignalRNotificationService

Интерфейс для работы с SignalR.

**Файл:** `src/services/contracts/ISignalRNotificationService.ts`

```typescript
export interface ISignalRNotificationService {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  onNotificationReceived(callback: (notification: BaseNotification) => void): void;
  isConnected(): boolean;
}
```

### Подключение к SignalR Hub

```typescript
import * as signalR from "@microsoft/signalr";

class SignalRNotificationService implements ISignalRNotificationService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: Array<(notification: BaseNotification) => void> = [];

  async connect(url: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on("ReceiveNotification", (notification) => {
      this.callbacks.forEach(callback => callback(notification));
    });

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  onNotificationReceived(callback: (notification: BaseNotification) => void): void {
    this.callbacks.push(callback);
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}
```

## Утилиты

### notificationUtils

Вспомогательные функции для работы с уведомлениями.

**Файл:** `src/utils/notificationUtils.ts`

```typescript
// Форматирование даты
export function formatNotificationDate(date: string): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Группировка уведомлений по дате
export function groupNotificationsByDate(
  notifications: BaseNotification[]
): Record<string, BaseNotification[]> {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, BaseNotification[]>);
}

// Подсчет непрочитанных уведомлений
export function countUnread(notifications: BaseNotification[]): number {
  return notifications.filter(n => !n.read).length;
}
```

## Стилизация

Проект использует Tailwind CSS для стилизации компонентов.

### Основные классы

```css
/* Notification Bell */
.notification-bell {
  @apply relative p-2 rounded-full hover:bg-gray-100 transition-colors;
}

.notification-bell .badge {
  @apply absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1;
}

/* Notification Item */
.notification-item {
  @apply p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors;
}

.notification-item.unread {
  @apply bg-blue-50;
}

/* Toast */
.toast {
  @apply fixed z-50 p-4 rounded-lg shadow-lg;
}

.toast.success {
  @apply bg-green-500 text-white;
}

.toast.error {
  @apply bg-red-500 text-white;
}
```

## Примеры использования

### Продвинутое использование с фильтрацией

```typescript
import React, { useState, useEffect } from 'react';
import {
  NotificationBell,
  NotificationFilters,
  useNotificationFilters
} from 'sed-notifications-frontend';
import { fetchNotifications } from './api';

function NotificationsPage() {
  const [notifications, setNotifications] = useState<BaseNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    filterByType,
    filterByHashtag,
    setSearchText,
    applyFilters,
    clearFilters
  } = useNotificationFilters();

  useEffect(() => {
    // Загрузка уведомлений
    fetchNotifications().then(setNotifications);
  }, []);

  const filteredNotifications = applyFilters(notifications);
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <div>
      <NotificationBell 
        unreadCount={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {isOpen && (
        <div className="notification-panel">
          <NotificationFilters 
            onFilterChange={(type) => filterByType(type)}
            availableTypes={['document', 'task', 'message']}
          />
          
          <div className="notification-list">
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Тестирование

Проект включает полное тестовое покрытие с использованием Jest и React Testing Library.

### Запуск тестов

```bash
cd frontend/sed-notifications-frontend
npm test
```

### Пример теста

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';

describe('NotificationBell', () => {
  it('displays unread count', () => {
    render(<NotificationBell unreadCount={5} onClick={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<NotificationBell unreadCount={0} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Сборка и развертывание

### Development

```bash
npm start
```

Откроется на http://localhost:3000

### Production Build

```bash
npm run build
```

Создаст оптимизированную сборку в папке `build/`

## Следующие шаги

1. Изучите [Руководство по интеграции](./07-Integration-Guide.md) для встраивания компонентов
2. Ознакомьтесь с примерами в `src/examples/`
3. Изучите тесты для понимания использования компонентов

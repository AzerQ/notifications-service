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
├── components/                    # React компоненты
│   ├── NotificationBell.tsx       # Иконка колокольчика
│   ├── NotificationComponent.tsx  # Основной контейнер
│   ├── NotificationItem.tsx       # Элемент списка
│   ├── Toast.tsx                  # Всплывающие уведомления
│   └── RoutePreferencesModal.tsx  # Настройки маршрутов
├── hooks/                         # React hooks
│   ├── useNotificationStore.ts    # Доступ к store
│   └── useRoutePreferences.ts     # Работа с настройками
├── services/                      # Сервисы
│   ├── apiClient.ts               # REST API клиент
│   └── signalRService.ts          # SignalR клиент
├── store/                         # Управление состоянием
│   └── NotificationStore.ts       # MobX store
├── types/                         # TypeScript типы
│   └── index.ts                   # Общие интерфейсы
└── utils/                         # Утилиты
```

## Модели данных

### Notification

Базовая модель уведомления, соответствующая ответу API.

**Файл:** `src/types/index.ts`

```typescript
export interface Notification {
  id: string;
  receiverId: string;
  type: string;
  subType?: string;
  title: string;
  content: string;
  url?: string;
  icon?: { name: string; cssClass?: string };
  date: string;
  read: boolean;
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

**Файл:** `src/components/NotificationBell.tsx`

**Использование:**

```typescript
<NotificationBell 
  unreadCount={5} 
  onClick={() => setIsOpen(true)} 
/>
```

### NotificationComponent

Центральный компонент для отображения списка уведомлений.

**Файл:** `src/components/NotificationComponent.tsx`

**Основные возможности:**
- Отображение списка уведомлений в выпадающем меню
- Интеграция с SignalR для real-time обновлений
- Управление настройками маршрутов
- Отображение Toast уведомлений

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


## SignalR интеграция

### SignalRService

Сервис для работы с SignalR.

**Файл:** `src/services/signalRService.ts`

```typescript
export class SignalRService {
  private connection: signalR.HubConnection | null = null;

  async startConnection(config: SignalRConfig): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(config.hubUrl, {
        accessTokenFactory: () => config.accessToken || ''
      })
      .withAutomaticReconnect()
      .build();

    await this.connection.start();
  }

  onNotificationReceived(callback: (notification: Notification) => void): void {
    this.connection?.on("ReceiveNotification", callback);
  }
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

### Базовое использование

```typescript
import { NotificationComponent } from 'notification-component-mvp';

function App() {
  const config = {
    apiBaseUrl: 'http://localhost:5093/api',
    signalRHubUrl: 'http://localhost:5093/notificationHub',
    accessToken: 'your-jwt-token'
  };

  return (
    <NotificationComponent config={config} />
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

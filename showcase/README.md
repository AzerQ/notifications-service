# Notification Service Showcase Application

Полнофункциональное демонстрационное приложение для сервиса уведомлений с аутентификацией и управлением пользователями.

## Особенности

### Backend (.NET 8)
- ✅ JWT аутентификация
- ✅ Управление пользователями (регистрация/вход)
- ✅ Целевые уведомления через SignalR (только для конкретных пользователей)
- ✅ REST API для уведомлений
- ✅ Интеграция с основным сервисом уведомлений

### Frontend (React + TypeScript + MobX + Tailwind)
- ✅ Страница входа/регистрации
- ✅ Дашборд пользователя
- ✅ Отправка тестовых уведомлений
- ✅ Панель уведомлений в реальном времени
- ✅ SignalR интеграция с JWT
- ✅ Responsive дизайн с Tailwind CSS
- ✅ Управление состоянием через MobX

## Быстрый старт

### Предварительные требования

- .NET 8 SDK
- Node.js 18+ и npm
- SQLite (встроено)

### Запуск Backend

```bash
cd backend
dotnet restore
dotnet run --project src/NotificationService.Api
```

Backend API будет доступен на `http://localhost:5093`

### Запуск Frontend

```bash
cd showcase/frontend
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:3000`

## Использование

1. **Регистрация**: Откройте `http://localhost:3000/register` и создайте новый аккаунт
2. **Вход**: Войдите с вашими учетными данными
3. **Дашборд**: 
   - Отправляйте тестовые уведомления через форму
   - Наблюдайте уведомления в реальном времени в правой панели
   - Уведомления доставляются только конкретному пользователю через SignalR

## Архитектура

### Backend

```
backend/
├── src/
│   ├── NotificationService.Api/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs       # Аутентификация
│   │   │   ├── NotificationController.cs
│   │   │   └── UsersController.cs
│   │   ├── Services/
│   │   │   └── AuthService.cs          # JWT логика
│   │   ├── Providers/
│   │   │   └── UserIdProvider.cs       # SignalR user mapping
│   │   └── Hubs/
│   │       └── NotificationHub.cs      # SignalR hub
│   └── ...
```

### Frontend

```
showcase/frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── components/
│   │   ├── NotificationPanel.tsx
│   │   └── SendNotificationForm.tsx
│   ├── stores/
│   │   ├── AuthStore.ts                # MobX store для auth
│   │   ├── NotificationStore.ts        # MobX store для уведомлений
│   │   └── RootStore.ts
│   ├── services/
│   │   └── api.ts                      # API клиент
│   └── types/
│       └── index.ts
```

## Целевые уведомления через SignalR

### Как это работает

1. **Аутентификация**: Пользователь получает JWT токен при входе
2. **SignalR подключение**: Frontend подключается к SignalR hub с JWT токеном в query string
3. **User mapping**: `UserIdProvider` извлекает userId из JWT claims
4. **Целевая доставка**: Уведомления отправляются только конкретному пользователю через `Clients.User(userId)`

### Пример отправки целевого уведомления

```csharp
// Backend - NotificationController.cs
if (result.UserId.HasValue)
{
    await _hubContext.Clients.User(result.UserId.ToString())
        .SendAsync("ReceiveNotification", notification);
}
```

```typescript
// Frontend - NotificationStore.ts
this.connection = new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, {
    accessTokenFactory: () => token,  // JWT token
  })
  .build();

this.connection.on('ReceiveNotification', (notification) => {
  this.addNotification(notification);
});
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация

### Notifications

- `POST /api/notification` - Отправить уведомление
- `GET /api/notification/by-user/{userId}` - Получить уведомления пользователя

### SignalR Hub

- `ws://localhost:5093/notificationHub` - SignalR hub endpoint

## Конфигурация

### Backend - appsettings.json

```json
{
  "JwtSettings": {
    "SecretKey": "YourSecretKey...",
    "Issuer": "NotificationService",
    "Audience": "NotificationServiceClients"
  },
  "ConnectionStrings": {
    "Notifications": "Data Source=notifications.db"
  }
}
```

### Frontend - Environment Variables

Создайте `.env` файл:

```
VITE_API_URL=http://localhost:5093/api
VITE_SIGNALR_URL=http://localhost:5093/notificationHub
```

## Тестовые сценарии

### 1. Регистрация нового пользователя
- Перейдите на `/register`
- Заполните форму
- После регистрации автоматический вход и перенаправление на дашборд

### 2. Отправка уведомления
- На дашборде выберите тип уведомления
- Нажмите "Send Notification"
- Уведомление появится в правой панели в реальном времени

### 3. Целевая доставка
- Откройте приложение в двух браузерах с разными пользователями
- Отправьте уведомление от одного пользователя
- Уведомление получит только отправитель (целевая доставка)

## Компоненты уведомлений как локальный модуль

Компоненты уведомлений организованы в переиспользуемый npm пакет:

```bash
# В frontend/sed-notifications-frontend
npm run build:lib
npm pack

# В showcase приложении
npm install ../path/to/sed-notifications-frontend
```

Использование:

```typescript
import { NotificationBell, NotificationList } from '@sed-notifications/frontend';
import { NotificationsStore } from '@sed-notifications/frontend';
```

## Технологии

### Backend
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- SignalR
- JWT Authentication
- BCrypt для паролей

### Frontend
- React 18
- TypeScript
- MobX (управление состоянием)
- Tailwind CSS
- Vite (сборщик)
- Axios (HTTP клиент)
- SignalR Client
- React Router

## Следующие шаги

- [ ] Добавить возможность отправки уведомлений другим пользователям
- [ ] Реализовать пометку всех уведомлений как прочитанных
- [ ] Добавить фильтрацию уведомлений по типу
- [ ] Реализовать push уведомления в браузере
- [ ] Добавить тесты

## Лицензия

Смотрите основной [LICENSE](../LICENSE) файл.

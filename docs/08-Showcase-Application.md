# Showcase приложение

Полнофункциональное демонстрационное приложение, показывающее все возможности сервиса уведомлений с аутентификацией пользователей и целевой доставкой через SignalR.

## Обзор

Showcase приложение — это production-ready пример интеграции сервиса уведомлений в реальное приложение. Оно демонстрирует:

- 🔐 **JWT аутентификацию** — безопасная регистрация и вход пользователей
- 🎯 **Целевые уведомления** — доставка только конкретным пользователям
- 📱 **Real-time обновления** — мгновенная доставка через SignalR
- 🎨 **Современный UI** — Tailwind CSS с градиентами и анимациями
- 📊 **MobX управление состоянием** — реактивное обновление данных
- ⚡ **Vite** — быстрая разработка и сборка

## Архитектура

### Технологический стек

**Backend:**
- .NET 8
- JWT Authentication (System.IdentityModel.Tokens.Jwt)
- BCrypt для хеширования паролей
- SignalR для real-time
- SQLite для хранения данных
- Entity Framework Core

**Frontend:**
- React 18
- TypeScript 5
- MobX 6 (управление состоянием)
- Tailwind CSS 3 (стилизация)
- Vite 5 (сборщик)
- Axios (HTTP клиент)
- SignalR Client
- React Router 6
- Lucide React (иконки)

### Структура проекта

```
showcase/
├── README.md                    # Документация showcase
├── start.sh                     # Скрипт запуска (Linux/Mac)
├── start.bat                    # Скрипт запуска (Windows)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.tsx          # Страница входа
    │   │   ├── RegisterPage.tsx       # Страница регистрации
    │   │   └── DashboardPage.tsx      # Главная страница
    │   ├── components/
    │   │   ├── NotificationPanel.tsx  # Панель уведомлений
    │   │   └── SendNotificationForm.tsx
    │   ├── stores/
    │   │   ├── AuthStore.ts           # MobX store для auth
    │   │   ├── NotificationStore.ts   # MobX store для уведомлений
    │   │   └── RootStore.ts
    │   ├── services/
    │   │   └── api.ts                 # API клиент
    │   ├── types/
    │   │   └── index.ts               # TypeScript типы
    │   └── styles/
    │       └── index.css              # Tailwind CSS
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## Быстрый старт

### Требования

- .NET 8 SDK
- Node.js 18+ и npm
- SQLite (встроено)

### Установка и запуск

1. **Автоматический запуск (рекомендуется):**

```bash
cd showcase
./start.sh    # Linux/Mac
start.bat     # Windows
```

Скрипт автоматически:
- Соберет backend, если нужно
- Запустит backend на http://localhost:5093
- Установит зависимости frontend, если нужно
- Запустит frontend на http://localhost:3000

2. **Ручной запуск:**

**Backend:**
```bash
cd backend
dotnet build
dotnet run --project src/NotificationService.Api
```

**Frontend:**
```bash
cd showcase/frontend
npm install
npm run dev
```

### Первое использование

1. Откройте http://localhost:3000
2. Нажмите "Sign up" для регистрации
3. Заполните форму регистрации
4. После входа откроется дашборд
5. Выберите тип уведомления и нажмите "Send Notification"
6. Уведомление появится в панели справа в реальном времени

## Ключевые функции

### 1. Аутентификация

#### Регистрация

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "SecurePassword123",
  "phoneNumber": "+79001234567"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "guid",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "phoneNumber": "+79001234567",
    "role": "User"
  }
}
```

#### Вход

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "ivan@example.com",
  "password": "SecurePassword123"
}
```

**Response:** Аналогичен регистрации

### 2. Целевые уведомления через SignalR

#### Backend реализация

```csharp
// UserIdProvider.cs - Маппинг SignalR соединений на пользователей
public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}

// NotificationController.cs - Отправка целевого уведомления
if (result.Recipients != null && result.Recipients.Any())
{
    foreach (var recipient in result.Recipients)
    {
        await _hubContext.Clients.User(recipient.Id.ToString())
            .SendAsync("ReceiveNotification", notification);
    }
}
```

#### Frontend подключение

```typescript
// NotificationStore.ts
async initializeSignalR(userId: string, token: string) {
  this.connection = new signalR.HubConnectionBuilder()
    .withUrl('/notificationHub', {
      accessTokenFactory: () => token,  // JWT токен для аутентификации
    })
    .withAutomaticReconnect()
    .build();

  this.connection.on('ReceiveNotification', (notification) => {
    // Получаем только уведомления для текущего пользователя
    this.addNotification(notification);
  });

  await this.connection.start();
}
```

### 3. MobX управление состоянием

#### AuthStore

```typescript
export class AuthStore {
  user: User | null = null;
  token: string | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage(); // Восстановление сессии
  }

  async login(data: LoginRequest) {
    this.loading = true;
    try {
      const response = await authApi.login(data);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } finally {
      this.loading = false;
    }
  }

  get isAuthenticated() {
    return !!this.token && !!this.user;
  }
}
```

#### NotificationStore

```typescript
export class NotificationStore {
  notifications: Notification[] = [];
  connection: signalR.HubConnection | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  addNotification(notification: Notification) {
    // MobX автоматически обновит UI
    this.notifications = [notification, ...this.notifications];
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
}
```

### 4. Компоненты UI

#### NotificationPanel

Панель отображения уведомлений в реальном времени:

```typescript
const NotificationPanel: React.FC = observer(() => {
  const { notificationStore } = useStores();

  return (
    <div className="card">
      <h2>Notifications ({notificationStore.unreadCount} unread)</h2>
      {notificationStore.notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onClick={() => notificationStore.markAsRead(notification.id)}
        />
      ))}
    </div>
  );
});
```

#### SendNotificationForm

Форма для отправки тестовых уведомлений:

```typescript
const SendNotificationForm: React.FC = observer(() => {
  const { authStore } = useStores();
  const [notificationType, setNotificationType] = useState('UserRegistered');

  const handleSend = async () => {
    await notificationApi.send({
      route: notificationType,
      channel: 'Email',
      parameters: { /* ... */ }
    });
  };

  return (
    <form onSubmit={handleSend}>
      <select value={notificationType} onChange={/* ... */}>
        <option value="UserRegistered">User Registered</option>
        <option value="OrderCreated">Order Created</option>
        <option value="TaskAssigned">Task Assigned</option>
      </select>
      <button type="submit">Send Notification</button>
    </form>
  );
});
```

## Безопасность

### JWT токены

**Конфигурация (appsettings.json):**

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLongForJWT2024!",
    "Issuer": "NotificationService",
    "Audience": "NotificationServiceClients"
  }
}
```

**Claims в токене:**
- `sub` - User ID
- `email` - Email пользователя
- `name` - Имя пользователя
- `role` - Роль пользователя
- `jti` - Уникальный идентификатор токена

### Хеширование паролей

Используется BCrypt с автоматической солью:

```csharp
// Регистрация
user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

// Вход
bool isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
```

### CORS настройки

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Для SignalR
    });
});
```

## Стилизация с Tailwind CSS

### Utility классы

Приложение использует кастомные utility классы:

```css
/* src/styles/index.css */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
  }
  
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

### Градиенты

```tsx
{/* Login page */}
<div className="min-h-screen flex items-center justify-center 
                bg-gradient-to-br from-blue-500 to-purple-600">

{/* Register page */}
<div className="min-h-screen flex items-center justify-center 
                bg-gradient-to-br from-purple-500 to-pink-600">
```

## Расширение функционала

### Добавление нового типа уведомления

1. **Backend:** Создайте новый обработчик в `NotificationService.TestHandlers`
2. **Frontend:** Добавьте новый option в `SendNotificationForm`:

```typescript
<option value="NewNotification">New Notification Type</option>
```

3. Добавьте параметры в `handleSend`:

```typescript
case 'NewNotification':
  parameters = {
    UserId: authStore.user.id,
    CustomParam: 'value'
  };
  break;
```

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте route в `App.tsx`:

```typescript
<Route path="/new-page" element={<NewPage />} />
```

## Развертывание

### Production сборка

**Backend:**
```bash
cd backend
dotnet publish -c Release -o ./publish
```

**Frontend:**
```bash
cd showcase/frontend
npm run build
# Статические файлы в dist/
```

### Environment переменные

**Frontend (.env.production):**
```
VITE_API_URL=https://api.yourdomain.com/api
VITE_SIGNALR_URL=https://api.yourdomain.com/notificationHub
```

**Backend:**
```bash
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__Notifications="Data Source=/app/data/notifications.db"
export JwtSettings__SecretKey="ProductionSecretKey..."
```

### Docker

См. [07-Integration-Guide.md](./07-Integration-Guide.md) для Docker конфигурации.

## Troubleshooting

### Backend не запускается

**Проблема:** Порт 5093 занят

**Решение:**
```bash
# Linux/Mac
lsof -i :5093
kill -9 <PID>

# Windows
netstat -ano | findstr :5093
taskkill /PID <PID> /F
```

### SignalR не подключается

**Проблема:** CORS ошибка

**Решение:** Проверьте CORS настройки в `Program.cs`:
```csharp
app.UseCors("AllowFrontend");
```

**Проблема:** JWT токен не передается

**Решение:** Убедитесь, что токен передается в accessTokenFactory:
```typescript
.withUrl(hubUrl, {
  accessTokenFactory: () => token,
})
```

### Frontend не загружается

**Проблема:** Зависимости не установлены

**Решение:**
```bash
cd showcase/frontend
rm -rf node_modules package-lock.json
npm install
```

## Тестовые сценарии

### Сценарий 1: Целевая доставка

1. Откройте два браузера (или инкогнито режим)
2. Зарегистрируйте двух пользователей
3. Отправьте уведомление от пользователя A
4. Уведомление должно появиться только у пользователя A

### Сценарий 2: Восстановление сессии

1. Войдите в приложение
2. Обновите страницу (F5)
3. Сессия должна восстановиться автоматически
4. Уведомления должны продолжать приходить

### Сценарий 3: Разные типы уведомлений

1. Войдите в приложение
2. Отправьте "User Registered"
3. Отправьте "Order Created"
4. Отправьте "Task Assigned"
5. Все три должны появиться в панели с правильными данными

## Следующие шаги

- [ ] Добавить возможность отправки уведомлений другим пользователям
- [ ] Реализовать "Mark all as read"
- [ ] Добавить фильтрацию по типу уведомления
- [ ] Добавить поиск в уведомлениях
- [ ] Реализовать пагинацию для большого количества уведомлений
- [ ] Добавить звуковые уведомления
- [ ] Реализовать browser push notifications
- [ ] Добавить темную тему

## Заключение

Showcase приложение демонстрирует best practices для интеграции сервиса уведомлений:

✅ Безопасная аутентификация
✅ Целевая доставка через SignalR
✅ Современный React stack
✅ Чистая архитектура
✅ Responsive дизайн
✅ Production-ready код

Используйте его как основу для вашего собственного приложения!

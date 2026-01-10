# Справочник API

Полная документация REST API и SignalR Hub сервиса уведомлений.

## Базовый URL

```
http://localhost:5093/api
```

## REST API Endpoints

### 1. Создание и отправка уведомления

**Endpoint:** `POST /api/notification/{route}` или `POST /api/notification/{notificationCategory}/{route}`

**Описание:** Создает уведомление, сохраняет в БД и отправляет по указанным каналам.

**Request Body:**

```json
{
  "title": "string", // optional
  "message": "string", // optional
  "channels": ["Email", "InApp"], // optional
  "parameters": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Параметры:**
- `route` (в пути, обязательно) — тип/маршрут уведомления (например, "UserRegistered", "OrderCreated")
- `notificationCategory` (в пути, опционально) — категория уведомления
- `title` (опционально) — переопределение заголовка
- `message` (опционально) — переопределение содержимого
- `channels` (опционально) — массив каналов доставки (`Email`, `InApp`). По умолчанию используются все доступные для маршрута.
- `parameters` (обязательно) — параметры для резолвера данных и шаблона

**Response (201 Created):**

```json
{
  "title": "Welcome!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipients": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "createdNotificationIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ],
  "statusMessage": "Notification sended successfully"
}
```

**Пример запроса (UserRegistered):**

```bash
curl -X POST http://localhost:5093/api/notification/UserRegistered \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "UserId": "00000000-0000-0000-0000-000000000001",
      "WelcomeMessage": "Welcome aboard!"
    }
  }'
```

**Пример запроса (OrderCreated):**

```bash
curl -X POST http://localhost:5093/api/notification/OrderCreated \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "CustomerId": "00000000-0000-0000-0000-000000000001",
      "OrderNumber": "ORD-12345",
      "OrderTotal": 299.99,
      "ItemCount": 3
    }
  }'
```

**Пример запроса (TaskAssigned):**

```bash
curl -X POST http://localhost:5093/api/notification/TaskAssigned \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "AssigneeId": "00000000-0000-0000-0000-000000000001",
      "AssignerId": "00000000-0000-0000-0000-000000000002",
      "TaskTitle": "Complete project",
      "TaskDescription": "Finish the notification service",
      "Priority": "High",
      "DueDate": "2025-12-31T23:59:59Z"
    }
  }'
```

**Коды ответов:**
- `201 Created` — уведомление успешно создано и отправлено
- `400 Bad Request` — неверные данные запроса
- `404 Not Found` — маршрут или шаблон не найден
- `500 Internal Server Error` — внутренняя ошибка сервера

---

### 2. Получение уведомления по ID

**Endpoint:** `GET /api/notification/{id}`

**Описание:** Получает информацию об уведомлении по его идентификатору.

**Параметры:**
- `id` (path) — GUID уведомления

**Response (200 OK):**

```json
{
  "title": "Welcome!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipients": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "createdNotificationIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ],
  "statusMessage": "Notification sended successfully"
}
```

**Пример запроса:**

```bash
curl -X GET http://localhost:5093/api/notification/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Коды ответов:**
- `200 OK` — уведомление найдено
- `404 Not Found` — уведомление не найдено

---

### 3. Получение уведомлений текущего пользователя

**Endpoint:** `GET /api/notification/personal`

**Описание:** Получает уведомления текущего аутентифицированного пользователя.

**Query Параметры:**
- `OnlyUnread` (boolean) — только непрочитанные (default: false)
- `PageSize` (int) — размер страницы (default: 50)
- `PageNumber` (int) — номер страницы (default: 1)

**Response (200 OK):**

```json
{
  "notifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "receiverId": "00000000-0000-0000-0000-000000000001",
      "type": "Пользователь",
      "subType": "Регистрация пользователя",
      "title": "Welcome!",
      "content": "Welcome to our service!",
      "url": "https://example.com",
      "icon": { "name": "user" },
      "date": "2025-10-28T10:30:00Z",
      "read": false,
      "hashtags": ["пользователь", "регистрация"]
    }
  ],
  "request": {
    "onlyUnread": false,
    "pageSize": 50,
    "pageNumber": 1
  },
  "totalItemsCount": 1
}
```

**Пример запроса:**

```bash
curl -X GET "http://localhost:5093/api/notification/personal?OnlyUnread=true" \
  -H "Authorization: Bearer {token}"
```

---

### 4. Пометить все уведомления как прочитанные

**Endpoint:** `PUT /api/notification/personal/mark-all-read`

**Описание:** Помечает все уведомления текущего пользователя как прочитанные.

**Response (200 OK):** Пустое тело.

---

### 5. Установка флага прочтения для конкретного уведомления

**Endpoint:** `PUT /api/notification/set-read-flag`

**Query Параметры:**
- `notificationId` (Guid) — ID уведомления
- `flagValue` (boolean) — значение флага

**Response (200 OK):** Сообщение об успешном обновлении.

---

### 6. Поиск уведомлений (Admin only)

**Endpoint:** `POST /api/notification/search`

**Описание:** Расширенный поиск уведомлений по фильтрам.

---

### 7. Трансляция уведомления через SignalR (Admin only)

**Endpoint:** `POST /api/notification/broadcast`

**Описание:** Транслирует уведомление всем подключенным SignalR клиентам.

**Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "url": "string",
  "type": "string"
}
```

**Response (200 OK):**

```json
{
  "message": "Notification broadcast successfully"
}
```

---

## Users API

### Получение пользователя по ID

**Endpoint:** `GET /api/users/{userId}`

**Описание:** Получает информацию о пользователе. Пользователь может получить только свои данные, админ — любые.

**Response (200 OK):**

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "createdAt": "2025-10-28T10:00:00Z",
  "deviceToken": "token",
  "role": "User",
  "accountName": "DOMAIN\\user"
}
```

### Получение всех пользователей (Admin only)

**Endpoint:** `GET /api/users`

**Описание:** Получает список всех пользователей.

**Response (200 OK):** Массив объектов пользователя.

### Создание пользователей (Admin only)

**Endpoint:** `POST /api/users`

**Request Body:** Массив объектов пользователя.

**Response (204 No Content)**

---

## User Route Preferences API

### Получение предпочтений пользователя

**Endpoint:** `GET /api/users/{userId}/routes`

**Описание:** Получает настройки маршрутов уведомлений для пользователя.

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "00000000-0000-0000-0000-000000000001",
    "route": "UserRegistered",
    "enabled": true,
    "routeDisplayName": "Регистрация пользователя",
    "routeDescription": "..."
  }
]
```

### Обновление предпочтений маршрутов

**Endpoint:** `PUT /api/users/{userId}/routes`

**Request Body:**

```json
[
  {
    "route": "UserRegistered",
    "enabled": true
  }
]
```

**Response (204 No Content)**

---

## Authentication API

### 1. Отправка кода подтверждения на Email

**Endpoint:** `POST /api/auth/email/sendCode?email={email}`

**Response:** `CreatedMailChallengeResponse { challengeId, message }`

### 2. Вход по Email и коду

**Endpoint:** `POST /api/auth/email`

**Request Body:** `MailChallengeSubmit { id, code }`

**Response:** `LoginTokensResponse { refreshToken, accessToken }`

### 3. Вход через Windows Authentication

**Endpoint:** `POST /api/auth/windows`

**Response:** `LoginTokensResponse`

### 4. Обновление токена

**Endpoint:** `POST /api/auth/refresh`

**Request Body:** `RefreshTokenRequest { refreshTokenValue }`

**Response:** `AccessTokenResponse { accessToken }`

---

## SignalR Hub

### Hub URL

```
ws://localhost:5093/notificationHub
```

### События

#### ReceiveNotification

Событие, которое транслируется клиентам при получении нового уведомления.

**Payload:** `AppNotification` объект.

### Подключение к SignalR Hub

#### JavaScript/TypeScript

```javascript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5093/notificationHub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

// Подписка на событие
connection.on("ReceiveNotification", (notification) => {
    console.log("Received notification:", notification);
    // Обработка уведомления в UI
    displayNotification(notification);
});

// Запуск соединения
async function start() {
    try {
        await connection.start();
        console.log("SignalR Connected");
    } catch (err) {
        console.error("SignalR Connection Error:", err);
        setTimeout(start, 5000); // Повторная попытка через 5 сек
    }
}

// Обработка разрыва соединения
connection.onclose(async () => {
    await start();
});

start();
```

#### C# Client

```csharp
using Microsoft.AspNetCore.SignalR.Client;

var connection = new HubConnectionBuilder()
    .WithUrl("http://localhost:5093/notificationHub")
    .WithAutomaticReconnect()
    .Build();

connection.On<object>("ReceiveNotification", (notification) =>
{
    Console.WriteLine($"Received: {notification}");
});

await connection.StartAsync();
```

---

## Модели данных

### NotificationRequest

```typescript
interface NotificationRequest {
  title?: string;
  message?: string;
  channels?: ("Email" | "InApp")[];
  parameters: Record<string, any>;
}
```

### NotificationResponseDto

```typescript
interface NotificationResponseDto {
  title?: string;
  route: string;
  createdAt: string;
  recipients: UserDto[];
  createdNotificationIds: string[];
  statusMessage: string;
}
```

### UserDto

```typescript
interface UserDto {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}
```

### AppNotification (SignalR / Personal API)

```typescript
interface AppNotification {
  id: string;
  receiverId: string;
  type?: string;
  subType?: string;
  title: string;
  content: string;
  url: string;
  icon?: { name: string, cssClass?: string };
  date: string;
  read: boolean;
  author?: string;
  actions?: { name: string, label: string, url: string }[];
  hashtags?: string[];
  parameters?: { key: string, value: string, description: string }[];
}
```

---

## Коды ошибок

### 400 Bad Request

Неверные данные в запросе.

```json
{
  "error": "Validation failed",
  "details": [
    "Route is required",
    "Parameters cannot be empty"
  ]
}
```

### 404 Not Found

Ресурс не найден.

```json
{
  "error": "Not found",
  "message": "Notification with id '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found"
}
```

### 500 Internal Server Error

Внутренняя ошибка сервера.

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Swagger/OpenAPI

Интерактивная документация API доступна по адресу:

```
http://localhost:5093/swagger
```

Swagger UI предоставляет:
- Полный список endpoints
- Возможность тестирования API прямо в браузере
- Схемы моделей данных
- Примеры запросов и ответов

---

## Примеры использования

### Полный сценарий: Регистрация пользователя и отправка уведомления

```bash
# 1. Создать пользователя
curl -X POST http://localhost:5093/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com"
  }'

# Ответ:
# {
#   "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
#   "username": "john_doe",
#   "email": "john@example.com"
# }

# 2. Отправить приветственное уведомление
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "UserRegistered",
    "channel": "Email",
    "parameters": {
      "UserId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "WelcomeMessage": "Welcome to our platform!"
    }
  }'

# 3. Проверить уведомления пользователя
curl -X GET http://localhost:5093/api/notification/by-user/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### Интеграция с JavaScript приложением

```javascript
// Создание и отправка уведомления
async function sendNotification(route, parameters) {
  const response = await fetch('http://localhost:5093/api/notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route,
      parameters,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
  
  return await response.json();
}

// Получение уведомлений пользователя
async function getUserNotifications(userId) {
  const response = await fetch(
    `http://localhost:5093/api/notification/by-user/${userId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  return await response.json();
}

// Использование
await sendNotification('OrderCreated', {
  CustomerId: '00000000-0000-0000-0000-000000000001',
  OrderNumber: 'ORD-12345',
  OrderTotal: 299.99,
  ItemCount: 3,
});

const notifications = await getUserNotifications(
  '00000000-0000-0000-0000-000000000001'
);
console.log('User notifications:', notifications);
```

---

## Следующие шаги

1. Изучите [Frontend компоненты](./05-Frontend.md) для интеграции UI
2. Прочитайте [Руководство разработчика](./06-Development-Guide.md) для добавления новых обработчиков
3. Ознакомьтесь с [Руководством по интеграции](./07-Integration-Guide.md) для встраивания в ваше приложение

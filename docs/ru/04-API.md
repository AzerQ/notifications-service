# Справочник API

Полная документация REST API и SignalR Hub сервиса уведомлений.

## Базовый URL

```
http://localhost:5093/api
```

## REST API Endpoints

### 1. Создание и отправка уведомления

**Endpoint:** `POST /api/notification`

**Описание:** Создает уведомление, сохраняет в БД и отправляет по указанным каналам.

**Request Body:**

```json
{
  "route": "string",
  "channel": "string", // optional: "Email", "Sms", "Push", "Email,Push"
  "parameters": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Параметры:**
- `route` (обязательно) — тип/маршрут уведомления (например, "UserRegistered", "OrderCreated")
- `channel` (опционально) — каналы доставки через запятую. По умолчанию используются все доступные
- `parameters` (обязательно) — параметры для резолвера данных и шаблона

**Response (200 OK):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Welcome!",
  "message": "Welcome to our service, John!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipient": {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "channelStatuses": [
    {
      "channel": "Email",
      "status": "Sent"
    }
  ]
}
```

**Пример запроса (UserRegistered):**

```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "UserRegistered",
    "channel": "Email",
    "parameters": {
      "UserId": "00000000-0000-0000-0000-000000000001",
      "WelcomeMessage": "Welcome aboard!"
    }
  }'
```

**Пример запроса (OrderCreated):**

```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "OrderCreated",
    "channel": "Email",
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
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "TaskAssigned",
    "channel": "Email",
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
- `200 OK` — уведомление успешно создано и отправлено
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
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Welcome!",
  "message": "Welcome to our service, John!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipient": {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "channelStatuses": [
    {
      "channel": "Email",
      "status": "Sent"
    }
  ]
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

### 3. Получение уведомлений пользователя

**Endpoint:** `GET /api/notification/by-user/{userId}`

**Описание:** Получает все уведомления конкретного пользователя.

**Параметры:**
- `userId` (path) — GUID пользователя

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Welcome!",
    "message": "Welcome to our service!",
    "route": "UserRegistered",
    "createdAt": "2025-10-28T10:30:00Z",
    "recipient": {
      "id": "00000000-0000-0000-0000-000000000001",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "channelStatuses": [
      {
        "channel": "Email",
        "status": "Sent"
      }
    ]
  },
  {
    "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "title": "Order Confirmation",
    "message": "Your order has been placed!",
    "route": "OrderCreated",
    "createdAt": "2025-10-28T11:00:00Z",
    "recipient": {
      "id": "00000000-0000-0000-0000-000000000001",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "channelStatuses": [
      {
        "channel": "Email",
        "status": "Sent"
      }
    ]
  }
]
```

**Пример запроса:**

```bash
curl -X GET http://localhost:5093/api/notification/by-user/00000000-0000-0000-0000-000000000001
```

**Коды ответов:**
- `200 OK` — возвращает массив уведомлений (может быть пустым)

---

### 4. Получение уведомлений по статусу

**Endpoint:** `GET /api/notification/by-status/{status}`

**Описание:** Получает уведомления с определенным статусом доставки.

**Параметры:**
- `status` (path) — статус доставки: `Pending`, `Sent`, `Failed`, `Skipped`

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Welcome!",
    "message": "Welcome to our service!",
    "route": "UserRegistered",
    "createdAt": "2025-10-28T10:30:00Z",
    "recipient": {
      "id": "00000000-0000-0000-0000-000000000001",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "channelStatuses": [
      {
        "channel": "Email",
        "status": "Sent"
      }
    ]
  }
]
```

**Пример запроса:**

```bash
curl -X GET http://localhost:5093/api/notification/by-status/Sent
```

**Коды ответов:**
- `200 OK` — возвращает массив уведомлений
- `400 Bad Request` — неизвестный статус

---

### 5. Трансляция уведомления через SignalR

**Endpoint:** `POST /api/notification/broadcast`

**Описание:** Транслирует уведомление всем подключенным SignalR клиентам.

**Request Body:**

```json
{
  "title": "string",
  "message": "string",
  "route": "string"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Notification broadcasted successfully"
}
```

**Пример запроса:**

```bash
curl -X POST http://localhost:5093/api/notification/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Notification",
    "message": "Maintenance scheduled for tonight",
    "route": "SystemAlert"
  }'
```

---

## Users API

### Получение пользователя по ID

**Endpoint:** `GET /api/users/{id}`

**Описание:** Получает информацию о пользователе.

**Response (200 OK):**

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "deviceToken": "device_token_here"
}
```

### Получение всех пользователей

**Endpoint:** `GET /api/users`

**Описание:** Получает список всех пользователей.

**Response (200 OK):**

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john_doe",
    "email": "john@example.com"
  },
  {
    "id": "00000000-0000-0000-0000-000000000002",
    "username": "jane_smith",
    "email": "jane@example.com"
  }
]
```

### Создание пользователя

**Endpoint:** `POST /api/users`

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "deviceToken": "device_token_here"
}
```

**Response (201 Created):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "deviceToken": "device_token_here"
}
```

---

## User Route Preferences API

### Получение предпочтений пользователя

**Endpoint:** `GET /api/user-route-preferences/{userId}`

**Описание:** Получает настройки маршрутов уведомлений для пользователя.

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "00000000-0000-0000-0000-000000000001",
    "route": "UserRegistered",
    "isEnabled": true
  },
  {
    "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "userId": "00000000-0000-0000-0000-000000000001",
    "route": "OrderCreated",
    "isEnabled": false
  }
]
```

### Обновление предпочтения маршрута

**Endpoint:** `PUT /api/user-route-preferences/{userId}/{route}`

**Request Body:**

```json
{
  "isEnabled": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Preference updated successfully"
}
```

---

## SignalR Hub

### Hub URL

```
ws://localhost:5000/notificationHub
```

### События

#### ReceiveNotification

Событие, которое транслируется клиентам при получении нового уведомления.

**Payload:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "New Notification",
  "message": "You have a new notification",
  "route": "SystemAlert",
  "createdAt": "2025-10-28T10:30:00Z"
}
```

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
  route: string;                      // Тип уведомления
  channel?: string;                   // Каналы доставки (опционально)
  parameters: Record<string, any>;    // Параметры для обработчика
}
```

### NotificationResponseDto

```typescript
interface NotificationResponseDto {
  id: string;                         // GUID уведомления
  title: string;                      // Заголовок
  message: string;                    // Содержимое
  route: string;                      // Тип уведомления
  createdAt: string;                  // ISO 8601 дата создания
  recipient: UserDto;                 // Получатель
  channelStatuses: ChannelStatusDto[]; // Статусы по каналам
}
```

### UserDto

```typescript
interface UserDto {
  id: string;                         // GUID пользователя
  username: string;                   // Имя пользователя
  email: string;                      // Email
  phoneNumber?: string;               // Телефон (опционально)
  deviceToken?: string;               // Токен устройства (опционально)
}
```

### ChannelStatusDto

```typescript
interface ChannelStatusDto {
  channel: "Email" | "Sms" | "Push"; // Канал доставки
  status: "Pending" | "Sent" | "Failed" | "Skipped"; // Статус
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

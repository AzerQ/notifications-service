# Руководство по аутентификации и авторизации API

## Обзор

API защищен с использованием JWT (JSON Web Tokens) аутентификации. Все эндпоинты, кроме `/api/auth/*`, требуют валидный JWT токен в заголовке Authorization.

API поддерживает два способа аутентификации:
1. **Email с кодом подтверждения** - для пользователей без доменной учетной записи
2. **Windows Authentication (NTLM/Kerberos)** - сквозная авторизация для доменных пользователей

## Аутентификация

### Способ 1: Email с кодом подтверждения

#### 1.1. Отправка кода подтверждения на email

**Endpoint:** `POST /api/auth/email/sendCode`

**Параметры:**
- `email` (query) - email пользователя

**Пример запроса:**
```bash
curl -X POST "http://localhost:5000/api/auth/email/sendCode?email=admin@example.com"
```

**Ответ:**
```json
{
  "id": "guid-challenge-id",
  "message": "Check your mailbox (admin@example.com) and enter code"
}
```

#### 1.2. Вход с кодом подтверждения

**Endpoint:** `POST /api/auth/email`

**Тело запроса:**
```json
{
  "id": "guid-challenge-id",
  "code": "123456"
}
```

**Пример запроса:**
```bash
curl -X POST "http://localhost:5000/api/auth/email" \
  -H "Content-Type: application/json" \
  -d '{
  "id": "your-challenge-id",
    "code": "123456"
  }'
```

**Ответ:**
```json
{
  "refreshToken": "refresh-token-value",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Способ 2: Windows Authentication (сквозная авторизация)

#### 2.1. Вход через доменную учетную запись

**Endpoint:** `POST /api/auth/windows`

**Требования:**
- Пользователь должен быть аутентифицирован в домене Windows
- В системе должен существовать пользователь с соответствующим `AccountName` (например, `DOMAIN\username`)

**Пример запроса (PowerShell с использованием учетных данных по умолчанию):**
```powershell
# Windows автоматически передаст учетные данные текущего пользователя
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/windows" `
  -Method POST `
  -UseDefaultCredentials
```

**Пример запроса (curl с NTLM):**
```bash
curl -X POST "http://localhost:5000/api/auth/windows" \
  --negotiate -u : \
  -H "Content-Type: application/json"
```

**Пример запроса (C# HttpClient):**
```csharp
var handler = new HttpClientHandler
{
    UseDefaultCredentials = true
};

using var client = new HttpClient(handler);
var response = await client.PostAsync(
    "http://localhost:5000/api/auth/windows", 
    null);

var result = await response.Content.ReadAsStringAsync();
```

**Ответ:**
```json
{
  "refreshToken": "refresh-token-value",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Возможные ошибки:**

**401 Unauthorized:**
```json
{
  "message": "Windows identity not found"
}
```
Причина: Windows аутентификация не прошла или учетные данные не переданы.

**404 Not Found:**
```json
{
  "message": "User with account name 'DOMAIN\\username' not found in the system"
}
```
Причина: Пользователь с таким доменным именем не зарегистрирован в системе.

#### 2.2. Настройка пользователей для Windows Authentication

Убедитесь, что в базе данных есть пользователи с заполненным полем `AccountName`:

**Пример в `appsettings.Development.json`:**
```json
{
  "SeedUsers": [
    {
      "Id": "b606cd21-7260-45b3-9e6f-6053690add9a",
 "Name": "Domain Admin",
      "Email": "admin@company.com",
 "AccountName": "COMPANY\\administrator",
      "Role": "Admin",
      "CreatedAt": "2024-06-01T00:00:00Z"
    },
    {
      "Id": "9490fae9-2a4c-4545-8025-7dd3bf8397ec",
      "Name": "Domain User",
      "Email": "user@company.com",
   "AccountName": "COMPANY\\user1",
      "Role": "User",
      "CreatedAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

**Или через API (требуется Admin):**
```bash
curl -X POST "http://localhost:5000/api/users" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{
 "id": "new-guid",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "accountName": "COMPANY\\john.doe",
    "role": "User",
    "createdAt": "2024-01-01T00:00:00Z"
  }]'
```

### 3. Обновление access токена

**Endpoint:** `POST /api/auth/refresh`

**Тело запроса:**
```json
{
  "refreshTokenValue": "your-refresh-token"
}
```

**Пример запроса:**
```bash
curl -X POST "http://localhost:5000/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshTokenValue": "your-refresh-token"
  }'
```

**Ответ:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Использование API с токеном

После получения access токена, включайте его в заголовок Authorization для всех запросов:

```bash
curl -X GET "http://localhost:5000/api/notification/by-user/{userId}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Авторизация и права доступа

### Роли пользователей

- **User** - обычный пользователь
- **Admin** - администратор с расширенными правами

### Матрица прав доступа

| Endpoint | Метод | Обычный пользователь | Администратор |
|----------|-------|----------------------|---------------|
| `/api/auth/email/sendCode` | POST | ? Анонимный | ? Анонимный |
| `/api/auth/email` | POST | ? Анонимный | ? Анонимный |
| `/api/auth/windows` | POST | ? Windows Auth | ? Windows Auth |
| `/api/auth/refresh` | POST | ? Анонимный | ? Анонимный |
| `/api/notification` | POST | ? | ? |
| `/api/notification/{id}` | GET | ? | ? |
| `/api/notification/by-user/{userId}` | GET | ? Только свои | ? Любые |
| `/api/notification/by-status/{status}` | GET | ? | ? |
| `/api/notification/broadcast` | POST | ? Анонимный (тест) | ? Анонимный (тест) |
| `/api/users` | GET | ? | ? |
| `/api/users` | POST | ? | ? |
| `/api/users/{userId}` | GET | ? Только свои | ? Любые |
| `/api/users/{userId}/routes` | GET | ? Только свои | ? Любые |
| `/api/users/{userId}/routes` | PUT | ? Только свои | ? Любые |

## Примеры использования

### Получение своих уведомлений

```bash
# 1. Войти в систему
curl -X POST "http://localhost:5000/api/auth/email/sendCode?email=test@example.com"

# 2. Ввести код из email
curl -X POST "http://localhost:5000/api/auth/email" \
  -H "Content-Type: application/json" \
  -d '{"id": "challenge-id", "code": "123456"}'

# Сохранить accessToken из ответа

# 3. Получить свои уведомления
curl -X GET "http://localhost:5000/api/notification/by-user/{your-user-id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Обновление своих настроек уведомлений

```bash
curl -X PUT "http://localhost:5000/api/users/{your-user-id}/routes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"route": "UserRegistered", "enabled": true},
    {"route": "TaskAssigned", "enabled": false}
  ]'
```

### Получение списка всех пользователей (только администратор)

```bash
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

## Обработка ошибок

### 401 Unauthorized
Токен отсутствует, невалиден или истек. Необходимо войти заново или обновить токен.

```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
Пользователь аутентифицирован, но не имеет прав для выполнения действия.

```json
{
  "message": "Forbidden"
}
```

**Решение:** Убедитесь, что:
- Вы пытаетесь получить доступ только к своим ресурсам
- У вас есть роль Admin для административных операций

## Настройка JWT в appsettings.json

```json
{
  "JwtSettings": {
    "SecretKey": "YOUR_SECRET_KEY_MUST_BE_AT_LEAST_32_CHARACTERS_LONG",
    "Issuer": "NotificationService",
  "Audience": "NotificationServiceClients",
    "AccessTokenExpirationMinutes": 45,
    "RefreshTokenExpirationHours": 240,
    "RefreshTokensForUserMaxCount": 5,
    "RefreshTokenSault": "ENTER_YOUR_SAULT_HERE"
  }
}
```

## SignalR с аутентификацией

При подключении к SignalR hub, передайте токен в query string:

```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notificationHub?access_token=YOUR_ACCESS_TOKEN")
    .build();
```

## Тестирование в Swagger

1. Откройте Swagger UI: `http://localhost:5000/swagger`
2. Нажмите кнопку "Authorize" вверху страницы
3. Введите токен в формате: `Bearer YOUR_ACCESS_TOKEN`
4. Нажмите "Authorize" и "Close"
5. Теперь все запросы будут включать токен автоматически

## Безопасность

### Рекомендации

1. **Храните токены безопасно:**
   - Access токены - в memory (не в localStorage)
   - Refresh токены - в httpOnly cookies или secure storage

2. **Используйте HTTPS в продакшене**

3. **Регулярно обновляйте токены:**
   - Access токены живут 45 минут
   - Refresh токены живут 10 дней

4. **Генерируйте сильные секретные ключи:**
   ```bash
   # Генерация секретного ключа
   openssl rand -base64 64
   ```

5. **Настройте CORS правильно:**
   ```json
   {
     "CORS": {
       "AllowedOrigins": ["https://your-frontend-domain.com"],
       "AllowCredentials": true
     }
   }
   ```

## Troubleshooting

### Проблема: "Invalid or expired refresh token"

**Причина:** Refresh токен истек или был отозван.

**Решение:** Войдите заново через `/api/auth/email`

### Проблема: "User with email {email} doesn't exists"

**Причина:** Пользователь не зарегистрирован в системе.

**Решение:** 
1. Создайте пользователя через администратора
2. Или добавьте в `appsettings.Development.json` в секцию `SeedUsers`

### Проблема: Токен не принимается

**Решение:**
1. Проверьте формат: `Authorization: Bearer TOKEN` (со словом Bearer)
2. Убедитесь, что токен не истек
3. Проверьте, что SecretKey одинаковый при генерации и валидации

## Полезные расширения

Для удобного тестирования API рекомендуем:

- **Postman** - для ручного тестирования
- **REST Client** (VS Code расширение) - для тестирования из .http файлов
- **jwt.io** - для декодирования и проверки JWT токенов

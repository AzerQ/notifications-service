# Windows Authentication Setup Guide

## Обзор

NotificationService API поддерживает сквозную Windows Authentication (NTLM/Kerberos) для доменных пользователей. Это позволяет пользователям входить в систему без необходимости вводить пароль, используя их доменные учетные данные.

## Как это работает

1. Пользователь отправляет запрос на `/api/auth/windows` с Windows credentials
2. Сервер аутентифицирует пользователя через Windows Authentication (NTLM/Kerberos)
3. Сервер ищет пользователя в БД по полю `AccountName` (например, `DOMAIN\username`)
4. Если пользователь найден, генерируются JWT токены (access + refresh)
5. Пользователь может использовать эти токены для доступа к защищенным endpoint'ам

## Требования

### 1. Пользователи в базе данных

Убедитесь, что пользователи в БД имеют заполненное поле `AccountName`:

```json
{
  "id": "guid",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "accountName": "COMPANY\\john.doe",  // Формат: DOMAIN\username
  "role": "User",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Настройка в appsettings.json

Windows Authentication уже настроена в `AuthConfig.cs`:

```csharp
services
    .AddAuthentication(...)
    .AddJwtBearer(...)
    .AddNegotiate(); // <- Windows Authentication

services.AddAuthorizationBuilder()
    .AddPolicy("WindowsAuth", policy =>
        policy.RequireAuthenticatedUser()
     .AddAuthenticationSchemes("Negotiate"));
```

## Тестирование

### Способ 1: PowerShell Script

Запустите тестовый скрипт:

```powershell
cd tests
.\test-windows-auth.ps1 -BaseUrl "http://localhost:5000"
```

Скрипт автоматически:
- Получит ваше доменное имя
- Попытается войти через Windows Auth
- Протестирует API с полученными токенами
- Покажет детальную информацию о результате

### Способ 2: PowerShell Manual

```powershell
# 1. Получить токены
$response = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/auth/windows" `
    -Method POST `
    -UseDefaultCredentials `
    -ContentType "application/json"

$token = $response.accessToken

# 2. Использовать токен для API запросов
$headers = @{ "Authorization" = "Bearer $token" }

$users = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/users" `
    -Method GET `
    -Headers $headers
```

### Способ 3: C# HttpClient

```csharp
var handler = new HttpClientHandler
{
    UseDefaultCredentials = true
};

using var client = new HttpClient(handler);

// Получить токены
var response = await client.PostAsync(
    "http://localhost:5000/api/auth/windows", 
    null);

var result = await response.Content.ReadFromJsonAsync<LoginTokensResponse>();
var accessToken = result.AccessToken;

// Использовать токен
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", accessToken);

var users = await client.GetFromJsonAsync<List<User>>(
  "http://localhost:5000/api/users");
```

### Способ 4: curl (с NTLM)

```bash
curl -X POST "http://localhost:5000/api/auth/windows" \
  --negotiate -u : \
  -H "Content-Type: application/json"
```

## Добавление пользователей для Windows Auth

### Через API (требуется Admin роль)

```bash
curl -X POST "http://localhost:5000/api/users" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "new-guid-here",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "accountName": "COMPANY\\john.doe",
    "role": "User",
 "createdAt": "2024-01-01T00:00:00Z"
  }]'
```

### Через appsettings.Development.json

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
    }
  ]
}
```

## Troubleshooting

### Ошибка: 401 Unauthorized - "Windows identity not found"

**Причина:** Windows Authentication не прошла.

**Решение:**
1. Убедитесь, что вы используете `UseDefaultCredentials = true`
2. Проверьте, что сервер поддерживает Windows Authentication
3. Убедитесь, что вы в домене

### Ошибка: 404 Not Found - "User with account name 'DOMAIN\username' not found"

**Причина:** Пользователь не зарегистрирован в системе.

**Решение:**
1. Добавьте пользователя в БД с правильным `AccountName`
2. Формат должен быть: `DOMAIN\username` (с обратным слэшем)
3. Проверьте, что имя совпадает с `User.Identity.Name`

### Проверка текущего доменного имени

```powershell
# PowerShell
[System.Security.Principal.WindowsIdentity]::GetCurrent().Name

# Вывод: COMPANY\john.doe
```

### REST Client не поддерживает Windows Auth

**Проблема:** VS Code REST Client и многие HTTP клиенты не поддерживают Windows Authentication.

**Решение:** Используйте:
- PowerShell с `Invoke-RestMethod` + `UseDefaultCredentials`
- Postman (поддерживает NTLM)
- C# HttpClient с `HttpClientHandler.UseDefaultCredentials = true`
- curl с флагом `--negotiate`

## Безопасность

### Рекомендации

1. **Используйте HTTPS в продакшене** - Windows credentials передаются в заголовках
2. **Ограничьте доступ по домену** - добавляйте только доверенных пользователей
3. **Регулярно проверяйте AccountName** - удаляйте уволившихся сотрудников
4. **Логируйте попытки входа** - отслеживайте подозрительную активность

### Настройка CORS для Windows Auth

```json
{
  "CORS": {
    "AllowedOrigins": ["https://your-internal-domain.com"],
    "AllowCredentials": true  // Важно для Windows Auth!
  }
}
```

## Production Deployment

### IIS Setup

1. Установите Windows Authentication в IIS:
   ```
   Install-WindowsFeature Web-Windows-Auth
```

2. Включите Windows Authentication для сайта:
   - Откройте IIS Manager
   - Выберите ваш сайт
   - Authentication ? Windows Authentication ? Enable

3. Отключите Anonymous Authentication (опционально)

### Kestrel Setup

В `Program.cs` уже настроено через `.AddNegotiate()`

Для production добавьте в `appsettings.Production.json`:

```json
{
  "Authentication": {
    "Negotiate": {
      "Enabled": true
    }
  }
}
```

## Frontend Integration

### React Example

```typescript
// Для Windows Auth нужно использовать credentials: 'include'
const response = await fetch('http://localhost:5000/api/auth/windows', {
  method: 'POST',
  credentials: 'include',  // Отправляет Windows credentials
  headers: {
    'Content-Type': 'application/json'
}
});

const { accessToken, refreshToken } = await response.json();

// Сохранить токены и использовать для последующих запросов
localStorage.setItem('accessToken', accessToken);
```

### Angular Example

```typescript
// В HttpClient настроить withCredentials
this.http.post(
  'http://localhost:5000/api/auth/windows',
  null,
  { withCredentials: true }
).subscribe(response => {
  this.accessToken = response.accessToken;
});
```

## Дополнительные ресурсы

- [Microsoft Docs: Windows Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/windowsauth)
- [ASP.NET Core Negotiate Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/negotiate)
- [JWT Authentication Guide](./08-Authentication-Guide.md)

## Примеры использования

См. также:
- `tests/test-windows-auth.ps1` - Полный тестовый скрипт
- `tests/api-test-requests.http` - HTTP примеры
- `docs/08-Authentication-Guide.md` - Полное руководство по аутентификации

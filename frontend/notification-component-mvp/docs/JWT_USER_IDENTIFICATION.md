# JWT Token-Based User Identification

## ?? Архитектура безопасности

### Принцип работы

**Вся информация о пользователе извлекается из JWT токена на backend**. Frontend НЕ должен передавать никакие ID пользователя - это все содержится в access token.

## ?? JWT Token Structure

### Декодированный Access Token

```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "9490fae9-2a4c-4545-8025-7dd3bf8397ec",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "Test user 1",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "test@example.com",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User",
  "exp": 1762798517,
  "iss": "NotificationService",
  "aud": "NotificationServiceClients"
}
```

### Claims Mapping

| Claim Type | Property | Description |
|------------|----------|-------------|
| `ClaimTypes.NameIdentifier` | `Id` | User GUID |
| `ClaimTypes.Name` | `Name` | User display name |
| `ClaimTypes.Email` | `Email` | User email address |
| `ClaimTypes.MobilePhone` | `PhoneNumber` | User phone (optional) |
| `ClaimTypes.Role` | `Role` | User role (User/Admin) |

## ?? Backend Implementation

### 1. ApplicationUser Model

**Файл:** `src/NotificationService.Api/Authentication/Models/ApplicationUser.cs`

```csharp
public record ApplicationUser
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
  public string? Role { get; set; }

    /// <summary>
    /// Maps JWT claims to ApplicationUser object
    /// </summary>
    public static ApplicationUser MapFromClaims(IEnumerable<Claim> claims)
    {
        var claimList = claims.ToList();
        return new ApplicationUser
        {
            Id = Guid.Parse(claimList.First(c => c.Type == ClaimTypes.NameIdentifier).Value),
  Name = claimList.First(c => c.Type == ClaimTypes.Name).Value,
            Email = claimList.First(c => c.Type == ClaimTypes.Email).Value,
            PhoneNumber = claimList.FirstOrDefault(c => c.Type == ClaimTypes.MobilePhone)?.Value,
      Role = claimList.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value ?? UserRoles.User
     };
 }

    public bool IsAdmin => string.Equals("Admin", Role);
}
```

### 2. ClaimsPrincipal Extensions

**Файл:** `src/NotificationService.Api/Authentication/Extensions/ClaimsPrincipalExtensions.cs`

```csharp
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Get ApplicationUser object from ClaimsPrincipal
    /// Extracts all user information from JWT claims
    /// </summary>
    public static ApplicationUser GetApplicationUser(this ClaimsPrincipal principal)
    {
        return ApplicationUser.MapFromClaims(principal.Claims);
    }

    /// <summary>
    /// Check if user is admin
    /// </summary>
    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
    return GetApplicationUser(principal).IsAdmin;
    }
}
```

### 3. Usage in Controllers

**Правильно:** ?

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthConfig.JwtAuthPolicyName)]
public class NotificationController : ControllerBase
{
    [HttpGet("personal")]
    public async Task<ActionResult> GetUserNotifications([FromQuery] GetUserNotificationsRequest request)
    {
        // Извлекаем ID пользователя из JWT токена
        var currentUserId = User.GetApplicationUser().Id;
     
        var result = await _queryService.GetUserNotifications(currentUserId, request);
 return Ok(result);
    }
}
```

**Неправильно:** ?

```csharp
// НЕ ДЕЛАЙТЕ ТАК!
[HttpGet("personal/{userId}")]
public async Task<ActionResult> GetUserNotifications(Guid userId)
{
    // ? Пользователь может подделать userId и получить чужие данные!
    var result = await _queryService.GetUserNotifications(userId, request);
    return Ok(result);
}
```

### 4. Permission Checks

```csharp
[HttpGet("{userId:guid}")]
public async Task<ActionResult> GetUserById(Guid userId)
{
    // Извлекаем ID текущего пользователя из токена
    var currentUserId = User.GetApplicationUser().Id;

 // Проверка прав: пользователь может получить только свои данные
    if (currentUserId != userId && !User.IsAdmin())
    {
        return Forbid();
  }

var user = await _userRepository.GetUserByIdAsync(userId);
    if (user is null)
        return NotFound();

    return Ok(user);
}
```

## ?? Frontend Implementation

### ? Что НЕ нужно делать

```typescript
// ? НЕ ПЕРЕДАВАЙТЕ userId из frontend!
const config = {
  apiBaseUrl: 'http://localhost:5093',
  signalRHubUrl: 'http://localhost:5093/notificationHub',
  userId: 'hardcoded-user-id', // ? НЕПРАВИЛЬНО!
  accessToken: token,
};
```

### ? Правильная конфигурация

```typescript
// ? Только access token - все остальное в токене
const config = {
  apiBaseUrl: 'http://localhost:5093',
  signalRHubUrl: 'http://localhost:5093/notificationHub',
  accessToken: token, // Содержит user ID и другую информацию
};
```

### TypeScript Types

**Файл:** `src/types/index.ts`

```typescript
/**
 * Notification component configuration
 * Note: User ID is extracted from JWT token on backend, no need to pass it from frontend
 */
export interface NotificationComponentConfig {
  apiBaseUrl: string;
  signalRHubUrl: string;
  accessToken?: string; // Содержит всю информацию о пользователе
  onNotificationClick?: (notification: Notification) => void;
  maxNotifications?: number;
  onEmailCodeRequired?: (email: string, challengeId: string) => void;
  userEmail?: string; // Только для автоматической отправки кода
}
```

## ?? Flow Diagram

### HTTP Request with JWT

```
???????????????
?   Frontend  ?
???????????????
       ? GET /api/notification/personal
       ? Authorization: Bearer eyJhbGc...
       ?
???????????????????????????
?   ASP.NET Core API      ?
?  [Authorize] Middleware ?
???????????????????????????
 ? Validates JWT
        ? Extracts Claims
           ?
??????????????????????????????
?   NotificationController   ?
?  User.GetApplicationUser() ?
??????????????????????????????
           ? currentUserId = claim["nameidentifier"]
  ?
?????????????????????????????
?  NotificationQueryService ?
?  GetUserNotifications()   ?
?????????????????????????????
   ? WHERE receiverId = currentUserId
           ?
????????????????????
?Database      ?
?  Only user's  ?
?  notifications   ?
????????????????????
```

### SignalR Connection

```
???????????????
?   Frontend  ?
???????????????
       ? Connect to /notificationHub
       ? Access Token in Query or Header
    ?
???????????????????????????
?   SignalR Hub   ?
?  UserIdProvider     ?
???????????????????????????
      ? Gets userId from Claims
 ? connection.User.FindFirst(ClaimTypes.NameIdentifier)
     ?
??????????????????????????????
?   User-specific connection ?
?   Identified by userId     ?
??????????????????????????????
```

**Файл:** `src/NotificationService.Api/Providers/UserIdProvider.cs`

```csharp
public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
  {
      // Get user ID from JWT token claims
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
```

## ??? Security Benefits

### 1. Предотвращение подделки ID

**Без JWT:**
```http
GET /api/notification/personal?userId=some-other-user-id
```
? Пользователь может получить чужие уведомления!

**С JWT:**
```http
GET /api/notification/personal
Authorization: Bearer eyJhbGc...
```
? Backend извлекает ID из токена - подделка невозможна!

### 2. Централизованная аутентификация

- ID пользователя хранится в одном месте (JWT token)
- Все контроллеры используют единый механизм извлечения
- Нет риска рассинхронизации данных

### 3. Аудит и логирование

```csharp
var currentUser = User.GetApplicationUser();

_logger.LogInformation(
    "User {UserId} ({Email}) requested notifications",
    currentUser.Id,
    currentUser.Email
);
```

## ?? API Examples

### Get Personal Notifications

**Request:**
```http
GET /api/notification/personal?pageNumber=1&pageSize=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Processing:**
```csharp
var currentUserId = User.GetApplicationUser().Id;
// currentUserId = "9490fae9-2a4c-4545-8025-7dd3bf8397ec" (из токена)

var notifications = await _queryService.GetUserNotifications(currentUserId, request);
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-id",
"title": "Welcome!",
  "content": "Welcome to our service",
      "receiverId": "9490fae9-2a4c-4545-8025-7dd3bf8397ec",
      "createdAt": "2025-01-01T10:00:00Z"
 }
  ],
  "totalItemsCount": 10
}
```

### Mark Notification as Read

**Request:**
```http
PUT /api/notification/set-read-flag?notificationId=abc-123&flagValue=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend Processing:**
```csharp
var currentUserId = User.GetApplicationUser().Id;

// Дополнительная проверка: уведомление принадлежит текущему пользователю
var notification = await _db.Notifications.FindAsync(notificationId);
if (notification.ReceiverId != currentUserId && !User.IsAdmin())
{
    return Forbid();
}

notification.NotificationWasRead = flagValue;
await _db.SaveChangesAsync();
```

## ? Checklist для разработчиков

При добавлении нового endpoint:

- [ ] Добавлен атрибут `[Authorize]`
- [ ] ID пользователя извлекается через `User.GetApplicationUser().Id`
- [ ] Не используются параметры `userId` из query/route/body
- [ ] Добавлена проверка прав доступа (если нужно)
- [ ] Логирование использует `currentUser.Id` и `currentUser.Email`
- [ ] Unit тесты проверяют, что пользователь не может получить чужие данные

## ?? Резюме

### Backend

- **Всегда** используйте `User.GetApplicationUser()` для получения информации о текущем пользователе
- **Никогда** не доверяйте `userId` из параметров запроса
- **Всегда** проверяйте права доступа при работе с данными других пользователей

### Frontend

- **Никогда** не передавайте `userId` в конфигурации или параметрах
- **Только** передавайте `accessToken` - он содержит всю необходимую информацию
- Вся логика идентификации пользователя происходит на backend

### Безопасность

? **JWT токен** содержит проверенную информацию о пользователе  
? **Backend** извлекает данные из токена автоматически  
? **Подделка** ID невозможна - токен подписан секретным ключом  
? **Централизация** - один источник правды для user ID  

---

**Принцип:** Доверяйте только JWT токену. Все остальное - потенциально скомпрометировано! ??

# JWT Token Format Test

## Тест стандартных claims

После внесенных изменений JWT токен должен содержать короткие стандартные имена claims:

### Ожидаемый формат токена:

```json
{
  "sub": "9490fae9-2a4c-4545-8025-7dd3bf8397ec",  // User ID (вместо nameidentifier)
  "name": "Test user 1",           // User name
  "email": "test@examle.com",   // User email
  "role": "User",            // User role (ВАЖНО!)
  "exp": 1762285707,    // Expiration time
  "iss": "NotificationService",         // Issuer
  "aud": "NotificationServiceClients"              // Audience
}
```

### Изменения:

| Старый формат (URI) | Новый формат (короткий) | Описание |
|---------------------|-------------------------|----------|
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` | `sub` | User ID |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name` | `name` | Username |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` | `email` | Email |
| `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` | `role` | Role |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone` | `phone_number` | Phone |

### Преимущества коротких имен:

1. ? **Меньший размер токена** - короткие имена уменьшают размер JWT
2. ? **Стандарт JWT/OpenID Connect** - следуем спецификации RFC 7519
3. ? **Совместимость** - работает с большинством JWT библиотек
4. ? **Читаемость** - проще отлаживать и тестировать

## Тестирование

### 1. Через API:

```bash
# Получить токен
curl -X POST "http://localhost:5000/api/auth/email/sendCode?email=test@examle.com"
# Ввести код из консоли (если настроен email провайдер)

# Или использовать уже созданного пользователя
curl -X POST "http://localhost:5000/api/auth/email" \
  -H "Content-Type: application/json" \
  -d '{"id": "challenge-id", "code": "123456"}'
```

### 2. Декодировать токен:

Используйте https://jwt.io/ или:

```powershell
# PowerShell скрипт для декодирования JWT
function Decode-Jwt {
    param([string]$token)
    
    $parts = $token.Split('.')
    if ($parts.Count -lt 2) {
   Write-Error "Invalid JWT token"
        return
    }
    
    $payload = $parts[1]
    
    # Добавляем padding если нужно
    $padding = $payload.Length % 4
    if ($padding -gt 0) {
        $payload += '=' * (4 - $padding)
    }
    
    $bytes = [System.Convert]::FromBase64String($payload)
    $json = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    $json | ConvertFrom-Json | ConvertTo-Json -Depth 10
}

# Использование:
# $token = "ваш-jwt-токен"
# Decode-Jwt -token $token
```

### 3. Проверить claims в приложении:

```csharp
// В контроллере
var userId = User.GetUserId();           // Теперь работает с "sub"
var userName = User.GetUserName();       // Работает с "name"
var userEmail = User.GetUserEmail();     // Работает с "email"
var userRole = User.GetUserRole();       // Работает с "role"
var isAdmin = User.IsAdmin();  // Проверяет роль
```

### 4. Полный тест через PowerShell:

```powershell
# test-jwt-claims.ps1
$baseUrl = "http://localhost:5000"

# 1. Войти
$response = Invoke-RestMethod `
    -Uri "$baseUrl/api/auth/email/sendCode?email=test@examle.com" `
    -Method POST

Write-Host "Challenge ID: $($response.id)"

# Замените код на полученный из консоли/email
$code = Read-Host "Enter verification code"

$loginResponse = Invoke-RestMethod `
  -Uri "$baseUrl/api/auth/email" `
-Method POST `
    -ContentType "application/json" `
    -Body (@{
 id = $response.id
        code = $code
} | ConvertTo-Json)

$accessToken = $loginResponse.accessToken

Write-Host "`nAccess Token received:" -ForegroundColor Green
Write-Host $accessToken.Substring(0, 50)... -ForegroundColor Yellow

# 2. Декодировать payload
$parts = $accessToken.Split('.')
$payload = $parts[1]

# Добавить padding
$padding = $payload.Length % 4
if ($padding -gt 0) {
    $payload += '=' * (4 - $padding)
}

$bytes = [System.Convert]::FromBase64String($payload)
$json = [System.Text.Encoding]::UTF8.GetString($bytes)
$claims = $json | ConvertFrom-Json

Write-Host "`nDecoded JWT Claims:" -ForegroundColor Green
Write-Host ($claims | ConvertTo-Json -Depth 10) -ForegroundColor Cyan

# 3. Проверить формат claims
Write-Host "`nClaims Validation:" -ForegroundColor Green

$expectedClaims = @('sub', 'name', 'email', 'role', 'exp', 'iss', 'aud')
$actualClaims = $claims.PSObject.Properties.Name

foreach ($claim in $expectedClaims) {
    if ($actualClaims -contains $claim) {
        Write-Host "  ? $claim : $($claims.$claim)" -ForegroundColor Green
    } else {
        Write-Host "  ? $claim : MISSING" -ForegroundColor Red
    }
}

# Проверить отсутствие старых URI claims
$oldUriClaims = $actualClaims | Where-Object { $_ -like "http://*" -or $_ -like "https://*" }
if ($oldUriClaims.Count -eq 0) {
  Write-Host "`n? No legacy URI claims found - using standard short names!" -ForegroundColor Green
} else {
    Write-Host "`n? Found legacy URI claims:" -ForegroundColor Red
    $oldUriClaims | ForEach-Object {
   Write-Host "  - $_" -ForegroundColor Red
 }
}

# 4. Тестировать API с токеном
Write-Host "`nTesting API with token..." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $accessToken"
}

try {
    $userInfo = Invoke-RestMethod `
        -Uri "$baseUrl/api/users/$($claims.sub)" `
      -Method GET `
        -Headers $headers
    
    Write-Host "? Successfully retrieved user info" -ForegroundColor Green
    Write-Host "  User: $($userInfo.name)" -ForegroundColor Cyan
    Write-Host "  Email: $($userInfo.email)" -ForegroundColor Cyan
    Write-Host "  Role: $($userInfo.role)" -ForegroundColor Cyan
} catch {
    Write-Host "? Failed to retrieve user info: $($_.Exception.Message)" -ForegroundColor Red
}
```

## Важные замечания:

### 1. Обратная совместимость
`ClaimsPrincipalExtensions` поддерживает оба формата:
```csharp
// Сначала ищет короткое имя, потом полное URI
var userId = principal.FindFirst("sub")?.Value 
    ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

### 2. Роли
Теперь роли добавляются для всех пользователей:
- В `appsettings.Development.json` все пользователи имеют роль `"User"` или `"Admin"`
- Роль включается в JWT токен как `"role": "User"`

### 3. Авторизация
Атрибут `[Authorize(Roles = "Admin")]` теперь работает корректно благодаря:
```csharp
// В AuthConfig.cs
options.TokenValidationParameters = new TokenValidationParameters
{
// ...
    NameClaimType = "name",
    RoleClaimType = "role"  // Указываем использовать "role" для проверки ролей
};
```

## Troubleshooting

### Проблема: Роль не появляется в токене

**Решение:** Убедитесь, что в БД у пользователя заполнено поле `Role`:
```sql
-- Проверить роли пользователей
SELECT Id, Name, Email, Role FROM Users;

-- Обновить роль, если NULL
UPDATE Users SET Role = 'User' WHERE Role IS NULL;
```

### Проблема: Старый формат claims (URI)

**Решение:** Перезапустите приложение после изменений в `TokenService` и `AuthConfig`.

### Проблема: `[Authorize(Roles = "Admin")]` не работает

**Решение:** Проверьте:
1. В токене есть claim `"role": "Admin"`
2. В `AuthConfig.cs` установлен `RoleClaimType = "role"`
3. Пользователь действительно имеет роль Admin в БД

## Дополнительные ресурсы

- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [OpenID Connect Core 1.0 Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)
- [jwt.io - JWT Debugger](https://jwt.io/)

# Test Windows Authentication для NotificationService API
# Использование: .\test-windows-auth.ps1 -BaseUrl "http://localhost:5000"

param(
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "=== NotificationService Windows Authentication Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Функция для красивого вывода JSON
function Format-JsonOutput {
    param([string]$json)
    
    try {
        $obj = $json | ConvertFrom-Json
        return $obj | ConvertTo-Json -Depth 10
  } catch {
        return $json
    }
}

# 1. Получить текущее доменное имя пользователя
Write-Host "1. Текущий пользователь:" -ForegroundColor Green
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
Write-Host "   Account: $($currentUser.Name)" -ForegroundColor White
Write-Host "   Is Authenticated: $($currentUser.IsAuthenticated)" -ForegroundColor White
Write-Host ""

# 2. Попытка входа через Windows Authentication
Write-Host "2. Попытка входа через Windows Authentication..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/auth/windows" `
      -Method POST `
        -UseDefaultCredentials `
    -ContentType "application/json" `
   -ErrorAction Stop

    Write-Host "   Успешно!" -ForegroundColor Green
    Write-Host ""
    
    $accessToken = $response.accessToken
    $refreshToken = $response.refreshToken
    
    Write-Host "   Access Token (первые 50 символов):" -ForegroundColor Yellow
    Write-Host "   $($accessToken.Substring(0, [Math]::Min(50, $accessToken.Length)))..." -ForegroundColor White
    Write-Host ""
 
    Write-Host "   Refresh Token (первые 30 символов):" -ForegroundColor Yellow
    Write-Host "   $($refreshToken.Substring(0, [Math]::Min(30, $refreshToken.Length)))..." -ForegroundColor White
    Write-Host ""
    
    # 3. Декодирование JWT токена (базовый парсинг)
    Write-Host "3. Информация из JWT токена:" -ForegroundColor Green
    
    try {
        $tokenParts = $accessToken.Split('.')
   if ($tokenParts.Count -ge 2) {
    $payloadBase64 = $tokenParts[1]
            
     # Добавление padding если необходимо
        $padding = $payloadBase64.Length % 4
   if ($padding -gt 0) {
           $payloadBase64 += '=' * (4 - $padding)
     }
    
   $payloadJson = [System.Text.Encoding]::UTF8.GetString(
     [System.Convert]::FromBase64String($payloadBase64)
    )
    
            $payload = $payloadJson | ConvertFrom-Json
            
     Write-Host "   User ID: $($payload.'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier')" -ForegroundColor White
            Write-Host "   Name: $($payload.'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')" -ForegroundColor White
      Write-Host "   Email: $($payload.'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')" -ForegroundColor White
     Write-Host "   Role: $($payload.'http://schemas.microsoft.com/ws/2008/06/identity/claims/role')" -ForegroundColor White
            Write-Host "   Expires: $([DateTimeOffset]::FromUnixTimeSeconds($payload.exp).LocalDateTime)" -ForegroundColor White
   }
    } catch {
        Write-Host "   Не удалось декодировать токен" -ForegroundColor Red
    }
    Write-Host ""
    
    # 4. Тестирование API с полученным токеном
    Write-Host "4. Тестирование API с полученным токеном:" -ForegroundColor Green
    
    $headers = @{
"Authorization" = "Bearer $accessToken"
}
    
    # 4.1. Получить список всех пользователей
    Write-Host "   4.1. Получение списка пользователей..." -ForegroundColor Yellow
    try {
    $users = Invoke-RestMethod `
-Uri "$BaseUrl/api/users" `
       -Method GET `
      -Headers $headers `
 -ErrorAction Stop
  
    Write-Host "   Найдено пользователей: $($users.Count)" -ForegroundColor Green
        
        if ($users.Count -gt 0) {
   Write-Host "   Первый пользователь:" -ForegroundColor White
  Write-Host " ID: $($users[0].id)" -ForegroundColor White
    Write-Host "      Name: $($users[0].name)" -ForegroundColor White
            Write-Host "      Email: $($users[0].email)" -ForegroundColor White
            Write-Host "      Account Name: $($users[0].accountName)" -ForegroundColor White
            Write-Host "      Role: $($users[0].role)" -ForegroundColor White
      
        $testUserId = $users[0].id
     
    # 4.2. Получить уведомления пользователя
      Write-Host ""
 Write-Host "   4.2. Получение уведомлений пользователя $testUserId..." -ForegroundColor Yellow
try {
   $notifications = Invoke-RestMethod `
        -Uri "$BaseUrl/api/notification/by-user/$testUserId" `
      -Method GET `
        -Headers $headers `
        -ErrorAction Stop
         
      Write-Host "   Найдено уведомлений: $($notifications.Count)" -ForegroundColor Green
    } catch {
   Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}
        }
    } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Ошибка ($statusCode): $($_.Exception.Message)" -ForegroundColor Red
    
      if ($statusCode -eq 403) {
    Write-Host "   Доступ запрещен. Возможно, у пользователя недостаточно прав (требуется роль Admin)" -ForegroundColor Yellow
        }
    }
    
    # 5. Обновление токена
  Write-Host ""
    Write-Host "5. Тестирование обновления токена:" -ForegroundColor Green
    try {
    $refreshResponse = Invoke-RestMethod `
      -Uri "$BaseUrl/api/auth/refresh" `
            -Method POST `
         -ContentType "application/json" `
     -Body (@{ refreshTokenValue = $refreshToken } | ConvertTo-Json) `
    -ErrorAction Stop
        
  Write-Host "   Токен успешно обновлен!" -ForegroundColor Green
     Write-Host "   Новый Access Token (первые 50 символов):" -ForegroundColor Yellow
        Write-Host "   $($refreshResponse.accessToken.Substring(0, [Math]::Min(50, $refreshResponse.accessToken.Length)))..." -ForegroundColor White
  } catch {
   Write-Host "   Ошибка обновления токена: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   Ошибка входа!" -ForegroundColor Red
    Write-Host ""
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   HTTP Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Сообщение: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 401) {
        Write-Host "   Возможные причины:" -ForegroundColor Yellow
        Write-Host "   - Windows Authentication не настроена на сервере" -ForegroundColor Yellow
      Write-Host "   - Сервер не запущен или недоступен" -ForegroundColor Yellow
        Write-Host "   - Учетные данные не переданы корректно" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "   Возможные причины:" -ForegroundColor Yellow
      Write-Host "   - Пользователь с доменным именем '$($currentUser.Name)' не найден в системе" -ForegroundColor Yellow
   Write-Host "   - Необходимо добавить пользователя в БД с полем AccountName = '$($currentUser.Name)'" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "   Для решения проблемы:" -ForegroundColor Cyan
    Write-Host "   1. Убедитесь, что сервер запущен на $BaseUrl" -ForegroundColor White
    Write-Host "   2. Проверьте, что Windows Authentication включена в launchSettings.json" -ForegroundColor White
    Write-Host "   3. Добавьте пользователя в систему с правильным AccountName" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Тест завершен ===" -ForegroundColor Cyan

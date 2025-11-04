# Test JWT Claims Format
# Проверяет, что JWT токены используют стандартные короткие имена claims

param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$Email = "test@examle.com"
)

Write-Host "=== JWT Claims Format Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Email: $Email" -ForegroundColor Yellow
Write-Host ""

# Функция для декодирования JWT
function Decode-JwtPayload {
    param([string]$token)
    
    $parts = $token.Split('.')
    if ($parts.Count -lt 2) {
        throw "Invalid JWT token format"
    }
    
    $payload = $parts[1]
    
    # Добавить padding если необходимо
    $padding = $payload.Length % 4
    if ($padding -gt 0) {
        $payload += '=' * (4 - $padding)
    }
    
    $bytes = [System.Convert]::FromBase64String($payload)
    $json = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    return $json | ConvertFrom-Json
}

try {
    # 1. Отправить код
    Write-Host "1. Sending verification code to $Email..." -ForegroundColor Green
    
    $challengeResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/auth/email/sendCode?email=$Email" `
        -Method POST `
        -ErrorAction Stop
    
    Write-Host "   Challenge ID: $($challengeResponse.id)" -ForegroundColor White
    Write-Host "   $($challengeResponse.message)" -ForegroundColor White
    Write-Host ""
    
    # 2. Попросить ввести код
    Write-Host "2. Check your email/console for the verification code" -ForegroundColor Green
    $code = Read-Host "   Enter the verification code"
    Write-Host ""
    
    # 3. Войти с кодом
    Write-Host "3. Logging in with verification code..." -ForegroundColor Green
    
    $loginResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/auth/email" `
        -Method POST `
        -ContentType "application/json" `
     -Body (@{
      id = $challengeResponse.id
            code = $code
        } | ConvertTo-Json) `
        -ErrorAction Stop
    
    $accessToken = $loginResponse.accessToken
    $refreshToken = $loginResponse.refreshToken
    
    Write-Host "   ? Login successful!" -ForegroundColor Green
    Write-Host "   Access Token (first 60 chars): $($accessToken.Substring(0, [Math]::Min(60, $accessToken.Length)))..." -ForegroundColor White
    Write-Host ""
    
    # 4. Декодировать JWT payload
  Write-Host "4. Decoding JWT token..." -ForegroundColor Green
    
    $claims = Decode-JwtPayload -token $accessToken
    
    Write-Host "   JWT Claims (JSON):" -ForegroundColor Yellow
    Write-Host ($claims | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
    Write-Host ""
  
    # 5. Проверить формат claims
    Write-Host "5. Validating claims format..." -ForegroundColor Green
    
    $expectedStandardClaims = @{
        'sub' = 'User ID (NameIdentifier)'
        'name' = 'User Name'
    'email' = 'User Email'
        'role' = 'User Role'
        'exp' = 'Expiration Time'
        'iss' = 'Issuer'
        'aud' = 'Audience'
    }
  
    $actualClaims = $claims.PSObject.Properties.Name
    $allPassed = $true
    
    Write-Host "   Standard JWT Claims:" -ForegroundColor Yellow
    foreach ($claim in $expectedStandardClaims.Keys | Sort-Object) {
        $description = $expectedStandardClaims[$claim]
 
   if ($actualClaims -contains $claim) {
$value = $claims.$claim
   
     # Форматировать значение
     if ($claim -eq 'exp') {
                $expirationDate = [DateTimeOffset]::FromUnixTimeSeconds($value).LocalDateTime
              $value = "$value ($expirationDate)"
     }
            
      Write-Host "   ? $claim : $value" -ForegroundColor Green
            Write-Host "      ($description)" -ForegroundColor DarkGray
        } else {
            Write-Host "   ? $claim : MISSING" -ForegroundColor Red
            Write-Host "      ($description)" -ForegroundColor DarkGray
            $allPassed = $false
     }
    }
  
    Write-Host ""
    
    # 6. Проверить отсутствие старых URI claims
    Write-Host "6. Checking for legacy URI claims..." -ForegroundColor Green
    
    $legacyUriClaims = $actualClaims | Where-Object { 
   $_ -like "http://*" -or $_ -like "https://*" 
    }
    
    if ($legacyUriClaims.Count -eq 0) {
      Write-Host "   ? No legacy URI claims found!" -ForegroundColor Green
        Write-Host "   Using standard JWT short claim names ?" -ForegroundColor Green
    } else {
        Write-Host "   ? Found legacy URI claims:" -ForegroundColor Red
        $legacyUriClaims | ForEach-Object {
      Write-Host "      - $_" -ForegroundColor Red
      }
        $allPassed = $false
    }

    Write-Host ""
  
 # 7. Проверить наличие роли
    Write-Host "7. Validating role claim..." -ForegroundColor Green
    
    if ($claims.role) {
  Write-Host "   ? Role claim present: '$($claims.role)'" -ForegroundColor Green
        
  if ($claims.role -eq 'Admin') {
Write-Host "   User has ADMIN privileges" -ForegroundColor Magenta
    } elseif ($claims.role -eq 'User') {
        Write-Host "   User has USER privileges" -ForegroundColor White
        } else {
          Write-Host "   Warning: Unknown role '$($claims.role)'" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ? Role claim is MISSING!" -ForegroundColor Red
        Write-Host "   Authorization by role will NOT work!" -ForegroundColor Red
        $allPassed = $false
    }
    
    Write-Host ""
    
    # 8. Тестировать API с токеном
    Write-Host "8. Testing API with JWT token..." -ForegroundColor Green
 
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    try {
        # Попробовать получить информацию о пользователе
   $userId = $claims.sub
        
        $userInfo = Invoke-RestMethod `
    -Uri "$BaseUrl/api/users/$userId" `
 -Method GET `
   -Headers $headers `
  -ErrorAction Stop
        
        Write-Host "   ? Successfully retrieved user info" -ForegroundColor Green
        Write-Host "      ID: $($userInfo.id)" -ForegroundColor White
        Write-Host "   Name: $($userInfo.name)" -ForegroundColor White
  Write-Host " Email: $($userInfo.email)" -ForegroundColor White
  Write-Host "      Role: $($userInfo.role)" -ForegroundColor White
        
        # Проверить, что роль совпадает
        if ($userInfo.role -eq $claims.role) {
       Write-Host "   ? Role in token matches role in database" -ForegroundColor Green
        } else {
          Write-Host "   ? Role mismatch! Token: '$($claims.role)', DB: '$($userInfo.role)'" -ForegroundColor Red
  $allPassed = $false
 }
        
    } catch {
  Write-Host "   ? Failed to retrieve user info" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
     $allPassed = $false
    }
    
    Write-Host ""
    
    # 9. Итоговый результат
    Write-Host "=== Test Results ===" -ForegroundColor Cyan
    
 if ($allPassed) {
  Write-Host "? ALL TESTS PASSED!" -ForegroundColor Green
        Write-Host "JWT tokens are using standard short claim names" -ForegroundColor Green
        Write-Host "Role-based authorization is configured correctly" -ForegroundColor Green
    } else {
 Write-Host "? SOME TESTS FAILED" -ForegroundColor Red
        Write-Host "Please check the output above for details" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Token Summary:" -ForegroundColor Yellow
    Write-Host "  - Token size: $($accessToken.Length) characters" -ForegroundColor White
    Write-Host "  - Claims count: $($actualClaims.Count)" -ForegroundColor White
    Write-Host "  - Token expires: $([DateTimeOffset]::FromUnixTimeSeconds($claims.exp).LocalDateTime)" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "? Test failed with error:" -ForegroundColor Red
 Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor DarkRed
    Write-Host $_.Exception.StackTrace -ForegroundColor DarkRed
}

Write-Host ""
Write-Host "=== Test Completed ===" -ForegroundColor Cyan

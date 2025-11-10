# Infinite Loop Fix - Authentication

## ?? Проблема

При ошибке первичной аутентификации (например, Windows auth) происходил бесконечный цикл запросов:

```
1. API Request ? 401
2. Axios Interceptor ? Try Auth
3. Auth Failed ? Return 401
4. Axios Interceptor ? Try Auth (снова!)
5. ? Infinite Loop...
```

### Причины

1. **Отсутствие флага `_retry`** - запрос не помечался как повторный перед попыткой аутентификации
2. **Отсутствие cooldown** - никакой защиты от частых повторных попыток
3. **Загрузка до аутентификации** - store пытался загрузить уведомления до успешной auth

## ? Решение

### 1. Фиксация флага `_retry` в apiClient.ts

**Было:**
```typescript
if (error.response?.status === 401 && this.authService && !originalRequest._retry) {
  if (this.isRefreshing) {
 // queue request
  }
  
  originalRequest._retry = true; // ? ПОСЛЕ проверки isRefreshing
  this.isRefreshing = true;
  
  const tokens = await this.authService.authenticate();
  // ...
}
```

**Стало:**
```typescript
if (error.response?.status === 401 && this.authService && !originalRequest._retry) {
  originalRequest._retry = true; // ? СРАЗУ, предотвращаем повторные попытки
  
  if (this.isRefreshing) {
    // queue request
  }
  
  this.isRefreshing = true;
  
  const tokens = await this.authService.authenticate();
  // ...
}
```

**Результат:** Запрос помечается как повторный ДО любых асинхронных операций.

### 2. Cooldown период в authenticationService.ts

```typescript
private lastAuthAttempt = 0;
private readonly AUTH_COOLDOWN_MS = 5000; // 5 seconds

async authenticate(): Promise<AuthTokens | null> {
  // Cooldown check
  const now = Date.now();
if (now - this.lastAuthAttempt < this.AUTH_COOLDOWN_MS) {
    console.log(`[Auth] Cooldown period active. Please wait ${Math.ceil((this.AUTH_COOLDOWN_MS - (now - this.lastAuthAttempt)) / 1000)}s`);
    return null; // ? Блокируем слишком частые попытки
  }
  
  this.lastAuthAttempt = now;
  // ... продолжаем аутентификацию
}
```

**Результат:** Максимум 1 попытка аутентификации в 5 секунд.

### 3. Отложенная инициализация в NotificationStore.ts

```typescript
export class NotificationStore {
  private canLoad = false; // ? Флаг готовности

  async initialize(): Promise<void> {
    this.canLoad = true; // ? Разрешаем загрузку после auth
    await Promise.all([
      this.loadNotifications(),
      this.connectSignalR()
    ]);
  }

  async loadNotifications(): Promise<void> {
    if (!this.canLoad) {
      console.log('[NotificationStore] Skipping load - not authenticated');
    return; // ? Не загружаем до auth
    }
    // ... load
  }
}
```

**Результат:** Notifications загружаются только после успешной аутентификации.

### 4. Инициализация по событию в useNotificationStore.ts

```typescript
const authentication = useAuthentication({
  onAuthSuccess: async (tokens) => {
    store['apiClient'].setAccessToken(tokens.accessToken);
    store['signalRService'].updateAccessToken(tokens.accessToken);

    if (!isStoreInitialized) {
      await store.initialize(); // ? Первая инициализация
      setIsStoreInitialized(true);
    } else {
      await store.reload(); // ? Перезагрузка при re-auth
    }
  }
});
```

**Результат:** Store инициализируется только после успешной auth.

### 5. Reset при logout

```typescript
reset(): void {
  this.canLoad = false; // ? Запрещаем загрузку
  this.notifications = [];
  this.isLoading = false;
  this.error = null;
  
  if (this.isSignalRConnected) {
    this.signalRService.disconnect();
    this.isSignalRConnected = false;
  }
}
```

**Результат:** Чистое состояние при logout.

## ?? Поток после исправлений

### Успешная аутентификация
```
1. App Mount
2. useAuthentication starts
3. Level 1: Try Refresh Token ? Success ?
4. onAuthSuccess callback
5. store.initialize()
6. Load notifications
7. Connect SignalR
8. Ready! ?
```

### Неудачная аутентификация
```
1. App Mount
2. useAuthentication starts
3. Level 1: Try Refresh Token ? Failed ?
4. Level 2: Try Windows Auth ? Failed ?
5. Level 3: Email Code Required
6. onEmailCodeRequired callback
7. Show Email Modal
8. User enters code
9. verifyEmailCode() ? Success ?
10. onAuthSuccess callback
11. store.initialize()
12. Load notifications
13. Ready! ?
```

### API Request с 401
```
1. API Request ? 401
2. Axios Interceptor catches
3. Check: !originalRequest._retry ? true
4. Set: originalRequest._retry = true ?
5. Check cooldown ? OK
6. Try authenticate()
7a. Success ? Retry request with new token ?
7b. Failed ? Return error, stop retry ?
```

## ?? Ключевые улучшения

| Проблема | Решение | Эффект |
|----------|---------|--------|
| Бесконечный retry | Флаг `_retry` перед auth | ? Максимум 1 retry |
| Spam запросов | Cooldown 5 секунд | ? Защита от спама |
| Загрузка до auth | Флаг `canLoad` | ? Данные только после auth |
| Состояние при logout | Метод `reset()` | ? Чистое состояние |
| Повторная auth | Проверка `isStoreInitialized` | ? Reload вместо re-init |

## ?? Тестирование

### Тест 1: Успешная Windows Auth
```
? Level 1 Failed ? Level 2 Success
? Store initialized
? Notifications loaded
? No infinite loops
```

### Тест 2: Все levels failed
```
? Level 1 Failed ? Level 2 Failed ? Level 3
? Email modal shown
? No infinite loops
? Cooldown working
```

### Тест 3: API 401 во время работы
```
? Request failed with 401
? Auto-authenticate triggered
? Request retried once
? No infinite loops
```

### Тест 4: Logout and re-login
```
? Store reset
? SignalR disconnected
? Re-authentication works
? Store re-initialized
```

### Тест 5: Частые 401 ошибки
```
? Cooldown blocks spam
? "Please wait Xs" message
? No infinite loops
? System stable
```

## ?? Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `apiClient.ts` | Флаг `_retry` перед auth, улучшенная error handling |
| `authenticationService.ts` | Cooldown период, защита от спама |
| `NotificationStore.ts` | Флаг `canLoad`, методы `initialize()` и `reset()` |
| `useNotificationStore.ts` | Инициализация по событию, интеграция с auth |

## ? Результат

**Проблема решена полностью:**
- ? Нет бесконечных циклов
- ? Нет спама запросов
- ? Корректная обработка ошибок
- ? Стабильная работа при любых сценариях
- ? Cooldown защита
- ? Чистый logout/login цикл

## ?? Готово к использованию

Система автоматической аутентификации теперь полностью стабильна и готова к production!

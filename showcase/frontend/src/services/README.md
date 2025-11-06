# Authentication Interceptor

## Описание

`AuthInterceptor` - это класс, который автоматически обрабатывает переаутентификацию пользователя при истечении access token'а. Интерсептор перехватывает все HTTP запросы и ответы, автоматически добавляя токены аутентификации и обновляя их при необходимости.

## Основные функции

### Автоматическое добавление токенов
- Automatically добавляет `Authorization: Bearer {token}` заголовок ко всем исходящим запросам
- Использует токен из AuthStore или localStorage

### Автоматическое обновление токенов
- При получении 401 ошибки автоматически пытается обновить access token через refresh token
- Повторяет оригинальный запрос с новым токеном
- Обрабатывает очередь запросов во время обновления токена

### Обработка ошибок
- При неудачном обновлении токена автоматически выполняет logout
- Перенаправляет на страницу входа при необходимости
- Очищает все токены из localStorage и AuthStore

## Как это работает

### 1. Request Interceptor
```typescript
// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = this.authStore.accessToken || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Response Interceptor
```typescript
// Обрабатываем 401 ошибки
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Пытаемся обновить токен и повторить запрос
    }
    return Promise.reject(error);
  }
);
```

### 3. Queue Management
Интерсептор управляет очередью запросов во время обновления токена:
- Все запросы, получившие 401 во время обновления, помещаются в очередь
- После успешного обновления все запросы из очереди выполняются с новым токеном
- При неудачном обновлении все запросы из очереди отклоняются

## API

### Constructor
```typescript
new AuthInterceptor(api: AxiosInstance, authStore: AuthStore)
```

### AuthStore Interface
AuthStore должен реализовывать следующий интерфейс:
```typescript
interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  updateAccessToken(token: string): void;
  logout(): void;
}
```

## Интеграция

### 1. Импорт и инициализация
```typescript
import { AuthInterceptor } from './authInterceptor';
import { setupAuthInterceptor } from './api';

// В RootStore
setupAuthInterceptor(this.authStore);
```

### 2. API методы
```typescript
// Добавьте в authApi
refreshToken: async (data: RefreshTokenRequest): Promise<AccessTokenResponse> => {
  const response = await api.post<AccessTokenResponse>('/auth/refresh', data);
  return response.data;
}
```

## Безопасность

### Хранение токенов
- Access token хранится в AuthStore (память) и localStorage
- Refresh token хранится в AuthStore (память) и localStorage  
- При logout все токены удаляются

### Обновление токенов
- Refresh запросы выполняются только при наличии действительного refresh token
- При неудачном обновлении пользователь автоматически разлогинивается
- Новый access token обновляется во всех местах хранения синхронно

## Обработка ошибок

### Сценарии ошибок
1. **401 Unauthorized** - Автоматическое обновление токена
2. **Нет refresh token** - Немедленный logout
3. **Неудачное обновление** - Logout и перенаправление на login
4. **Сетевые ошибки** - Стандартная обработка без вмешательства

### Логирование
Интерсептор логирует важные события:
- Успешное обновление токенов
- Ошибки обновления токенов  
- Logout события

## Примеры использования

### Автоматическое обновление
```typescript
// Этот запрос автоматически получит новый токен при 401
const notifications = await notificationApi.getByUser(userId);
```

### Ручное обновление
```typescript
// Ручное обновление через AuthStore
try {
  await authStore.refreshAccessToken();
} catch (error) {
  // Пользователь разлогинен
}
```

## Особенности

1. **Thread-safe**: Только один процесс обновления токена может выполняться одновременно
2. **Queue управление**: Все запросы во время обновления ставятся в очередь
3. **Fallback**: При сбоях автоматически очищает состояние и перенаправляет на login
4. **Совместимость**: Работает с существующей архитектурой MobX + Axios
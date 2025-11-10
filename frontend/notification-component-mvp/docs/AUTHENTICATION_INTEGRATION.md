# Automatic Authentication Integration

## ?? Что реализовано

Механизм автоматической аутентификации для MVP компонента с трехуровневой стратегией fallback:

### ?? Стратегия аутентификации

1. **Level 1: Refresh Token** - Попытка обновить access token используя сохраненный refresh token
2. **Level 2: Windows Authentication** - Попытка аутентификации через Windows credentials
3. **Level 3: Email Code** - Запрос verification code на email пользователя

### ?? Новые файлы

#### Services
- `src/services/authenticationService.ts` - Основной сервис аутентификации
- Обновлен `src/services/apiClient.ts` - Добавлены axios interceptors для автоматической повторной аутентификации

#### Hooks
- `src/hooks/useAuthentication.ts` - React hook для управления аутентификацией
- Обновлен `src/hooks/useNotificationStore.ts` - Интеграция с системой аутентификации

#### Components
- `src/components/EmailCodeModal.tsx` - Модальное окно для ввода email verification code

#### Documentation
- `docs/AUTO_AUTHENTICATION.md` - Полная документация по системе аутентификации
- `docs/AUTHENTICATION_EXAMPLES.md` - 10 примеров использования

#### Demo
- Обновлен `src/DemoApp.tsx` - Демонстрация автоматической аутентификации

### ? Ключевые возможности

#### Автоматическая повторная аутентификация
При получении 401 ошибки система автоматически:
1. Останавливает текущий запрос
2. Пытается восстановить сессию (refresh ? Windows ? email)
3. Повторяет failed запросы после успешной аутентификации

#### Очередь запросов
Все запросы во время аутентификации буферизуются и автоматически повторяются после получения новых токенов.

#### Прозрачность для пользователя
- Levels 1-2 полностью прозрачны (без UI)
- Level 3 показывает модальное окно только если необходимо

#### React Integration
```typescript
const { store, authentication } = useNotificationStore({
  apiBaseUrl: 'http://localhost:5093',
  signalRHubUrl: 'http://localhost:5093/notificationHub',
  userId: 'user-id',
  onEmailCodeRequired: (email, challengeId) => {
    // Показать email modal
  }
});
```

### ?? Как использовать

#### 1. Базовое использование
```typescript
import { useNotificationStore } from '@notifications-service/inapp-component-mvp';

function App() {
const { store, authentication } = useNotificationStore(config);

  // store.notifications - доступ к уведомлениям
  // authentication.authState - состояние аутентификации
}
```

#### 2. С Email Modal
```typescript
import { EmailCodeModal } from '@notifications-service/inapp-component-mvp';

<EmailCodeModal
  isOpen={showModal}
  challengeId={authentication.authState.emailChallengeId || ''}
  onVerify={(verification) => authentication.verifyEmailCode(verification)}
  onResendCode={(email) => authentication.sendEmailCode(email)}
  onClose={() => setShowModal(false)}
/>
```

### ?? API Endpoints используемые

Все эти endpoints уже существуют в backend:

- `POST /api/auth/refresh` - Обновление access token
- `POST /api/auth/windows` - Windows authentication
- `POST /api/auth/email/sendCode` - Отправка email кода
- `POST /api/auth/email` - Проверка email кода

### ?? Поток аутентификации

```
API Request (401)
    ?
Queue Request
    ?
Level 1: Try Refresh Token
    ? (если failed)
Level 2: Try Windows Auth
    ? (если failed)
Level 3: Show Email Modal
    ? (пользователь вводит код)
Verify Email Code
    ?
Get New Tokens
    ?
Retry Queued Requests
```

### ?? Хранение токенов

Токены хранятся в `localStorage`:
- `accessToken` - JWT access token
- `refreshToken` - Refresh token для обновления

### ?? UI Компоненты

#### EmailCodeModal
- Градиентный дизайн (blue-purple)
- Автоформатирование 6-значного кода
- Валидация email
- Кнопка "Resend Code"
- Отображение ошибок
- Responsive дизайн

### ?? Документация

См. подробную документацию:
- `docs/AUTO_AUTHENTICATION.md` - Полное руководство
- `docs/AUTHENTICATION_EXAMPLES.md` - Примеры использования

### ?? Тестирование

Запустите demo приложение:
```bash
npm run dev
```

Откройте http://localhost:5173 и:
1. Компонент автоматически попытается аутентифицироваться при загрузке
2. Нажмите "Logout" для выхода
3. Нажмите "Re-Authenticate" для повторной попытки
4. Нажмите "Test Email Code" для тестирования email modal

### ?? Безопасность

- ? Токены в localStorage (защита от CSRF)
- ? Windows auth использует credentials
- ? Email codes с ограниченным временем жизни
- ? Автоматическая очистка invalid tokens

### ?? Production Ready

Система готова к использованию в production с учетом:
- Все методы аутентификации реализованы
- Error handling и retry логика
- TypeScript типизация
- Логирование для отладки
- Модульная архитектура

### ?? TODO (опционально)

- [ ] HttpOnly cookies вместо localStorage для refresh tokens
- [ ] Rate limiting на client side
- [ ] Biometric authentication (Level 4)
- [ ] Remember me функционал
- [ ] Session timeout warnings

### ?? Готово к использованию!

Просто импортируйте компоненты и hooks - вся магия аутентификации работает автоматически в фоне!

# Quick Start: Auto-Authentication

## ?? За 5 минут к автоматической аутентификации!

### Шаг 1: Установка (если используете как библиотеку)

```bash
npm install @notifications-service/inapp-component-mvp
```

### Шаг 2: Базовая настройка

```typescript
import React, { useState } from 'react';
import { 
  useNotificationStore, 
  EmailCodeModal 
} from '@notifications-service/inapp-component-mvp';

function App() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const { store, authentication } = useNotificationStore({
    apiBaseUrl: 'http://localhost:5093',
    signalRHubUrl: 'http://localhost:5093/notificationHub',
  userId: 'your-user-id',
    onEmailCodeRequired: (email) => {
      setUserEmail(email);
      setShowEmailModal(true);
    }
  });

  return (
    <>
    {/* Ваш контент */}
      <NotificationComponent store={store} />
      
   {/* Email modal - появится автоматически если нужно */}
      <EmailCodeModal
        isOpen={showEmailModal}
        challengeId={authentication.authState.emailChallengeId || ''}
        email={userEmail}
        isVerifying={authentication.authState.isAuthenticating}
        error={authentication.authState.error}
        onVerify={async (verification) => {
          await authentication.verifyEmailCode(verification);
    setShowEmailModal(false);
        }}
        onResendCode={(email) => authentication.sendEmailCode(email)}
     onClose={() => setShowEmailModal(false)}
      />
    </>
  );
}
```

### Шаг 3: Готово! ??

Вот и всё! Теперь ваше приложение:

? Автоматически пытается аутентифицироваться при загрузке  
? Автоматически обновляет токены при истечении  
? Пробует Windows authentication если refresh token не работает  
? Показывает email modal только если оба предыдущих метода не сработали  
? Автоматически повторяет failed запросы после успешной аутентификации  

## ?? Что происходит автоматически?

### При загрузке приложения
```
1. Проверка localStorage на наличие токенов
2. Попытка обновить access token через refresh token
   ? Успех ? работаем дальше
   ? Неудача ? переходим к шагу 3
3. Попытка Windows authentication
   ? Успех ? работаем дальше
   ? Неудача ? показываем email modal
```

### При API запросе (401 ошибка)
```
1. Перехват 401 ошибки через axios interceptor
2. Помещаем failed запрос в очередь
3. Запускаем процесс аутентификации (Level 1 ? 2 ? 3)
4. После успешной аутентификации:
   - Обновляем токены
   - Повторяем все запросы из очереди
   - Возвращаем результаты
```

## ?? Состояние аутентификации

Вы можете отслеживать состояние через `authentication.authState`:

```typescript
{
  isAuthenticated: boolean,        // Аутентифицирован ли пользователь
  isAuthenticating: boolean,       // Идет ли процесс аутентификации
  error: string | null,     // Ошибка аутентификации
emailChallengeId: string | null, // ID текущего email challenge
  requiresEmailCode: boolean       // Требуется ли ввод email кода
}
```

### Пример использования

```typescript
// Показать индикатор загрузки
{authentication.authState.isAuthenticating && <Spinner />}

// Показать статус
<div className={authentication.authState.isAuthenticated ? 'success' : 'error'}>
  {authentication.authState.isAuthenticated ? 'Authenticated ?' : 'Not Authenticated ?'}
</div>

// Показать ошибку
{authentication.authState.error && (
  <ErrorMessage>{authentication.authState.error}</ErrorMessage>
)}
```

## ?? Дополнительные методы

### Ручная аутентификация
```typescript
await authentication.authenticate();
```

### Logout
```typescript
authentication.logout();
```

### Отправка email кода вручную
```typescript
const challenge = await authentication.sendEmailCode('user@example.com');
```

### Проверка email кода
```typescript
await authentication.verifyEmailCode({
  id: challengeId,
  code: '123456'
});
```

## ?? Кастомизация Email Modal

Используйте свой компонент вместо EmailCodeModal:

```typescript
function CustomEmailModal() {
  const [code, setCode] = useState('');
  
  return (
    <YourModalComponent>
      <input 
        value={code}
onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />
      <button onClick={() => {
        authentication.verifyEmailCode({
          id: authentication.authState.emailChallengeId!,
        code
 });
      }}>
        Verify
      </button>
    </YourModalComponent>
  );
}
```

## ?? Отладка

Включите логирование в консоли:

```
[Auth] Level 1: Attempting refresh token authentication...
[Auth] Level 1: ? Refresh token authentication successful
```

или

```
[Auth] Level 1: ? Refresh token authentication failed
[Auth] Level 2: Attempting Windows authentication...
[Auth] Level 2: ? Windows authentication failed
[Auth] Level 3: Email code authentication required
```

## ?? Environment Variables

```.env
VITE_API_URL=http://localhost:5093
VITE_SIGNALR_URL=http://localhost:5093/notificationHub
VITE_USER_ID=your-user-id
```

## ?? Больше примеров

См. документацию:
- `docs/AUTO_AUTHENTICATION.md` - Полное руководство
- `docs/AUTHENTICATION_EXAMPLES.md` - 10 готовых примеров
- `src/DemoApp.tsx` - Рабочий пример

## ?? Поздравляем!

Теперь у вас есть полностью автоматическая система аутентификации с тремя уровнями fallback! 

Никаких ручных вызовов login/logout - всё работает само! ??

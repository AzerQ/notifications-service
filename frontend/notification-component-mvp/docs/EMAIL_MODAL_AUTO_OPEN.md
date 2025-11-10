# Email Modal Auto-Open Feature

## ?? Автоматическое открытие модалки при неудаче Windows Auth

### Проблема
При неудачной Windows аутентификации пользователь должен вручную вводить email и код для аутентификации.

### Решение
Теперь при неудаче Windows authentication автоматически открывается модальное окно с двумя шагами:

1. **Шаг 1: Ввод Email** - пользователь вводит свой email адрес
2. **Шаг 2: Ввод Кода** - после отправки кода, пользователь вводит полученный код

## ?? Как это работает

### Поток аутентификации

```
1. App Mount
   ?
2. Level 1: Try Refresh Token
   ? Failed
   ?
3. Level 2: Try Windows Authentication
   ? Failed
   ?
4. Email Modal Opens Automatically ?
   ?
5. User enters email
   ?
6. Code sent to email
   ?
7. User enters code
 ?
8. Authentication successful ?
```

### State Management

Новые поля в `authState`:

```typescript
interface AuthState {
  // ...existing fields
  requiresEmailInput: boolean; // NEW: Нужен ли ввод email
  requiresEmailCode: boolean;  // Нужен ли ввод кода
}
```

### Автоматическое открытие модалки

```typescript
// В DemoApp.tsx
useEffect(() => {
  if (authentication.authState.requiresEmailInput || 
      authentication.authState.requiresEmailCode) {
    setShowEmailModal(true); // Автоматически открываем модалку
  }
}, [authentication.authState.requiresEmailInput, 
    authentication.authState.requiresEmailCode]);
```

## ?? Использование

### Базовое использование

```typescript
import { useNotificationStore, EmailCodeModal } from '@notifications/mvp';

function App() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  const { store, authentication } = useNotificationStore({
    apiBaseUrl: 'http://localhost:5093',
 signalRHubUrl: 'http://localhost:5093/notificationHub',
    userId: 'user-id',
  });

  // Автоматическое открытие модалки
  useEffect(() => {
  if (authentication.authState.requiresEmailInput || 
        authentication.authState.requiresEmailCode) {
    setShowEmailModal(true);
    }
  }, [authentication.authState.requiresEmailInput, 
    authentication.authState.requiresEmailCode]);

  return (
    <>
      <NotificationComponent store={store} />
    
      <EmailCodeModal
        isOpen={showEmailModal}
  challengeId={authentication.authState.emailChallengeId || ''}
email={currentEmail}
        isVerifying={authentication.authState.isAuthenticating}
    error={authentication.authState.error}
    onVerify={(v) => authentication.verifyEmailCode(v)}
     onResendCode={(email) => authentication.sendEmailCode(email)}
        onClose={() => setShowEmailModal(false)}
        requiresEmailInput={authentication.authState.requiresEmailInput}
      />
    </>
  );
}
```

### С предзаполненным email

Если вы знаете email пользователя заранее:

```typescript
const { store, authentication } = useNotificationStore({
  apiBaseUrl: 'http://localhost:5093',
  signalRHubUrl: 'http://localhost:5093/notificationHub',
  userId: 'user-id',
  userEmail: 'user@example.com', // Предзаполненный email
});
```

При неудаче Windows auth:
- Код автоматически отправится на указанный email
- Модалка откроется сразу на шаге ввода кода
- Пользователь просто вводит код, без ввода email

## ?? EmailCodeModal - Два режима

### Режим 1: С вводом email (requiresEmailInput=true)

```typescript
<EmailCodeModal
isOpen={true}
  challengeId="" // Пусто на первом шаге
  requiresEmailInput={true} // Показываем шаг ввода email
  onResendCode={(email) => sendCode(email)}
  // ...other props
/>
```

**UI:**
```
???????????????????????????????
? Enter Your Email            ?
???????????????????????????????
? Windows authentication      ?
? failed. Please enter your   ?
? email address...     ?
?            ?
? Email Address      ?
? ??????????????????????????? ?
? ? your.email@example.com  ? ?
? ??????????????????????????? ?
?           ?
?  [Cancel]    [Send Code]    ?
???????????????????????????????
```

### Режим 2: Только ввод кода (requiresEmailInput=false)

```typescript
<EmailCodeModal
  isOpen={true}
  challengeId="challenge-123"
  email="user@example.com"
  requiresEmailInput={false}
  // ...other props
/>
```

**UI:**
```
???????????????????????????????
? Email Verification ?
???????????????????????????????
? A verification code has     ?
? been sent to your email...  ?
?             ?
? Email Address   ?
? ??????????????????????????? ?
? ? user@example.com ? ?
? ??????????????????????????? ?
?           ?
? Verification Code   ?
? ??????????????????????????? ?
? ?       0 0 0 0 0 0   ? ?
? ??????????????????????????? ?
?        ?
? Resend Code  [Cancel][Verify]?
???????????????????????????????
```

## ?? Переход между шагами

### Автоматический переход

```typescript
// В EmailCodeModal.tsx
useEffect(() => {
  if (challengeId) {
    setStep('code'); // Автоматически переходим к вводу кода
  }
}, [challengeId]);
```

### Ручной возврат

Кнопка "Change" позволяет вернуться к вводу email:

```typescript
const handleBack = () => {
  setStep('email');
  setCode('');
};
```

## ?? Примеры использования

### Пример 1: Базовая интеграция

```typescript
function App() {
  const [showModal, setShowModal] = useState(false);
  const { authentication } = useNotificationStore(config);

  useEffect(() => {
    // Автоматическое открытие
    if (authentication.authState.requiresEmailInput) {
setShowModal(true);
    }
  }, [authentication.authState.requiresEmailInput]);

  return (
    <EmailCodeModal
      isOpen={showModal}
      requiresEmailInput={authentication.authState.requiresEmailInput}
      {...otherProps}
    />
  );
}
```

### Пример 2: С предзаполненным email

```typescript
const config = {
  apiBaseUrl: 'http://localhost:5093',
  signalRHubUrl: 'http://localhost:5093/notificationHub',
  userId: getCurrentUser().id,
  userEmail: getCurrentUser().email, // Автоматическая отправка кода
};

const { store, authentication } = useNotificationStore(config);

// При неудаче Windows auth:
// 1. Код автоматически отправляется на userEmail
// 2. Модалка открывается на шаге ввода кода
// 3. Пользователь только вводит код
```

### Пример 3: Ручной запуск с вводом email

```typescript
// Ручное открытие модалки с запросом email
const handleManualAuth = () => {
  authentication.setRequiresEmailInput(true);
  setShowEmailModal(true);
};

<button onClick={handleManualAuth}>
  Login with Email
</button>
```

## ?? API Reference

### useAuthentication

Новые поля в `authState`:

```typescript
{
  requiresEmailInput: boolean,  // Нужен ли ввод email
  requiresEmailCode: boolean,   // Нужен ли ввод кода
}
```

Новый метод:

```typescript
setRequiresEmailInput(requires: boolean): void
```

### EmailCodeModal Props

```typescript
interface EmailCodeModalProps {
  isOpen: boolean;
  challengeId: string;
  challengeMessage?: string;
  email?: string;
  isVerifying: boolean;
  error?: string | null;
  onVerify: (verification: EmailCodeVerification) => Promise<void>;
  onResendCode: (email: string) => Promise<void>;
  onClose: () => void;
  requiresEmailInput?: boolean; // NEW: Показывать ли шаг ввода email
}
```

### NotificationComponentConfig

Новое поле:

```typescript
interface NotificationComponentConfig {
  // ...existing fields
  userEmail?: string; // Опциональный email для автоматической отправки кода
}
```

## ? Что изменилось

### Файлы

| Файл | Изменения |
|------|-----------|
| `useAuthentication.ts` | + `requiresEmailInput` в state, автоотправка кода при `userEmail` |
| `EmailCodeModal.tsx` | + Двухшаговый режим (email ? code) |
| `DemoApp.tsx` | + Автооткрытие модалки при `requiresEmailInput/requiresEmailCode` |
| `types/index.ts` | + `userEmail` в `NotificationComponentConfig` |
| `useNotificationStore.ts` | + Передача `userEmail` в `useAuthentication` |

### Новые возможности

- ? Автоматическое открытие модалки при неудаче Windows auth
- ? Двухшаговый процесс: email ? code
- ? Автоотправка кода при известном email
- ? Кнопка "Change" для смены email
- ? Автопереход между шагами

## ?? Тестирование

```bash
npm run dev
```

### Сценарий 1: Windows auth failed, email неизвестен

1. Откройте приложение
2. Windows auth fails
3. Модалка открывается автоматически на шаге "Enter Your Email"
4. Введите email
5. Нажмите "Send Code"
6. Модалка переходит к шагу "Verification Code"
7. Введите код из email
8. Нажмите "Verify"
9. Аутентификация успешна ?

### Сценарий 2: Windows auth failed, email известен

1. Задайте `userEmail` в config
2. Откройте приложение
3. Windows auth fails
4. Код автоматически отправляется на email
5. Модалка открывается сразу на шаге "Verification Code"
6. Введите код
7. Нажмите "Verify"
8. Аутентификация успешна ?

### Сценарий 3: Тестовые кнопки

В DemoApp есть кнопки для тестирования:

```typescript
"Test Email Modal (with email input)" // Открывает модалку на шаге email
"Test Email Modal (code only)"       // Открывает модалку на шаге code
```

## ?? Результат

**Теперь при неудаче Windows authentication:**

1. ? Модалка открывается **автоматически**
2. ? Пользователь вводит email (или email уже известен)
3. ? Код отправляется на email
4. ? Пользователь вводит код
5. ? Аутентификация завершается успешно

**Никаких дополнительных действий не требуется - всё работает автоматически!** ??

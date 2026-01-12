# Руководство по интеграции

Этот документ описывает, как интегрировать компонент уведомлений в ваше хост-приложение и использовать его публичный API.

## 1. Встраивание компонента

### Как React-компонент
Если ваше приложение построено на React, вы можете импортировать и использовать компонент напрямую:

```tsx
import { NotificationComponent, useNotificationStore } from '@notifications-service/inapp-component-mvp';

const store = useNotificationStore({
  apiBaseUrl: 'https://api.your-service.com',
  signalRHubUrl: 'https://api.your-service.com/notificationHub'
});

// Рендеринг внутри вашего макета
<NotificationComponent />
```

### Как независимый модуль (Shadow DOM)
Компонент спроектирован как изолированный модуль. При сборке в режиме библиотеки его можно внедрить на любую страницу (например, через `<script>`).

## 2. Публичный API (`window.NotificationWidget`)

После монтирования компонент экспортирует глобальный объект в `window.NotificationWidget`. Это позволяет приложениям на других фреймворках (или на чистом JS) взаимодействовать с виджетом.

### Интерфейс API

```typescript
interface NotificationWidget {
  /** Обновить список уведомлений с сервера */
  refresh(): Promise<void>;
  /** Открыть выпадающий список */
  open(): void;
  /** Закрыть выпадающий список */
  close(): void;
  /** Регистрация обработчика для кнопок действий */
  registerActionHandler(name: string, handler: (args: Record<string, string>) => void): void;
}
```

### Примеры использования

#### Обновление токена
Когда ваше основное приложение обновляет JWT токен, необходимо уведомить об этом виджет:
```javascript
window.NotificationWidget.setToken('new-jwt-token');
```

#### Программное управление
```javascript
// Открыть список уведомлений
window.NotificationWidget.open();

// Принудительно обновить данные
window.NotificationWidget.refresh();
```

## 3. Кнопки действий (`appaction://`)

Виджет поддерживает интерактивные кнопки внутри уведомлений. Эти кнопки используют кастомный протокол `appaction://`.

### Как это работает
1. Бэкенд отправляет уведомление с URL действия, например: `appaction://approveDocument?docId=789&version=1`.
2. Виджет отрисовывает кнопку.
3. При клике виджет парсит URL и вызывает зарегистрированный обработчик.

### Регистрация обработчика
В вашем хост-приложении (например, Docsvision) зарегистрируйте функцию:

```javascript
window.NotificationWidget.registerActionHandler('approveDocument', (args) => {
  const { docId, version } = args;
  console.log(`Утверждение документа ${docId} версия ${version}`);
  
  // Выполните вашу бизнес-логику
  myApp.approve(docId);
});
```

## 4. Стилизация и изоляция

Компонент использует **CSS Modules** и обычно рендерится внутри **Shadow DOM**. Это гарантирует, что:
- Стили хост-приложения не "ломают" верстку виджета.
- Стили виджета не влияют на элементы основной страницы.

## 5. Поддержка TypeScript

Для обеспечения полной типобезопасности в вашем проекте вы можете подключить файл деклараций:
```typescript
/// <reference path="path/to/notification-widget.d.ts" />
```

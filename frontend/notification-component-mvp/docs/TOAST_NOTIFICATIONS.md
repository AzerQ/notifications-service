# Toast Notifications Integration

## Проблема

При получении новых уведомлений через SignalR Hub, они добавлялись в список уведомлений, но не показывались всплывающие уведомления (toasts). Пользователь не получал визуальной индикации о новом уведомлении, пока не откроет dropdown вручную.

## Решение

Добавлена система всплывающих уведомлений (toasts), которая автоматически показывает новое уведомление при получении через SignalR.

## Реализованные изменения

### 1. Создан компонент `Toast.tsx`

**Расположение:** `src/components/Toast.tsx`

**Назначение:** Отображение одного всплывающего уведомления

**Основные возможности:**
- ? Автоматическое закрытие через 5 секунд (настраивается)
- ? Кнопка ручного закрытия
- ? Плавная анимация появления и исчезновения
- ? Клик по уведомлению открывает URL (если есть)
- ? Отображение типа и подтипа уведомления (badges)
- ? Отображение автора уведомления
- ? Отображение до 3 хештегов
- ? Визуальный прогресс-бар автозакрытия
- ? Поддержка темной темы
- ? Hover эффект с масштабированием
- ? Line-clamp для длинного контента

**Props:**
```typescript
interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number; // по умолчанию 5000 мс
}
```

**Дизайн:**
- Белая карточка с тенью
- Синий badge для типа
- Фиолетовый badge для подтипа
- Прогресс-бар внизу
- Hover: поднимается вверх с увеличенной тенью и масштабом 1.02

### 2. Создан компонент `ToastContainer.tsx`

**Расположение:** `src/components/ToastContainer.tsx`

**Назначение:** Управление несколькими всплывающими уведомлениями

**Основные возможности:**
- ? Управление стеком уведомлений
- ? Автоматическое позиционирование (top-right)
- ? Отображение в столбик с отступами (gap-3)
- ? Правильный z-index для каждого toast
- ? Глобальный доступ через window API
- ? Автоматическое удаление закрытых уведомлений
- ? Логирование для отладки

**API:**
```typescript
// Глобальная функция для показа toast
(window as any).__showNotificationToast(notification);
```

**Layout:**
```
???????????????????????????
?  Toast #1 (newest)      ?  ? z-index: 100
???????????????????????????
?  Toast #2          ?  ? z-index: 99
???????????????????????????
?  Toast #3  ?  ? z-index: 98
???????????????????????????
```

### 3. Обновлен `NotificationStore.ts`

**Изменения:**
- ? Добавлено поле `showToastCallback` для хранения callback функции
- ? Добавлен метод `setShowToastCallback()` для регистрации callback
- ? Обновлен `handleNewNotification()` для показа toast при получении SignalR уведомления
- ? Toast показывается только когда dropdown закрыт
- ? Все новые уведомления автоматически добавляются в store
- ? Добавлено подробное логирование для отладки

**Логика показа toast:**
```typescript
private handleNewNotification(notification: Notification): void {
  console.log('[NotificationStore] New SignalR notification received:', notification);
  
  // Show toast ONLY if:
  // 1. Callback is registered
  // 2. Dropdown is closed
  if (this.showToastCallback && !this.isDropdownOpen) {
    console.log('[NotificationStore] Showing toast notification');
    this.showToastCallback(notification);
  } else {
    console.log('[NotificationStore] Toast not shown:', {
      hasCallback: !!this.showToastCallback,
      isDropdownOpen: this.isDropdownOpen // <-- критично!
    });
  }

  // ALWAYS add to store
  runInAction(() => {
    this.notifications.unshift(notification);
    this.totalCount += 1;
  });
}
```

### 4. Обновлен `NotificationDropdown.tsx`

**Изменения:**
- ? Добавлен импорт `ToastContainer`
- ? Добавлен `useEffect` для регистрации callback при монтировании
- ? `ToastContainer` всегда рендерится (даже когда dropdown закрыт)
- ? Callback очищается при размонтировании

**Новый код:**
```typescript
// Setup toast callback on mount
useEffect(() => {
  const showToast = (notification: any) => {
    if ((window as any).__showNotificationToast) {
      (window as any).__showNotificationToast(notification);
    }
  };
  
  store.setShowToastCallback(showToast);
  console.log('[NotificationDropdown] Toast callback registered');
  
  return () => {
    store.setShowToastCallback(undefined);
  };
}, [store]);

// ...

return (
  <>
    {/* ALWAYS render, even when dropdown closed */}
    <ToastContainer />
    
    {/* Dropdown only when open */}
  {store.isDropdownOpen && (
 <div>...</div>
    )}
  </>
);
```

### 5. Созданы CSS стили `toast.css`

**Расположение:** `src/styles/toast.css`

**Возможности:**
- ? Slide-in анимация справа
- ? Slide-out анимация при закрытии
- ? Progress bar анимация
- ? Hover эффекты
- ? Z-index управление для стека
- ? Responsive дизайн (mobile)
- ? Dark mode поддержка
- ? Accessibility (reduced motion)
- ? Print styles (скрыто при печати)

**Ключевые анимации:**
```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrinkProgress {
  from { width: 100%; }
  to { width: 0%; }
}
```

### 6. Обновлен `index.ts`

**Изменения:**
- ? Добавлены экспорты `Toast` и `ToastContainer`

### 7. Обновлен `index.css`

**Изменения:**
- ? Добавлен импорт `./styles/toast.css`
- ? Добавлен `.line-clamp-3` для обрезки текста

## Поток данных

```
1. SignalR Hub отправляет уведомление
      ?
2. signalRService.onNotification() получает событие
      ?
3. NotificationStore.handleNewNotification() обрабатывает
   ?
4. ? ВСЕГДА добавляется в store.notifications
      ?
5. Проверяется: есть ли callback и закрыт ли dropdown
      ?
6. Если ДА ? вызывается showToastCallback(notification)
      ?
7. window.__showNotificationToast(notification)
      ?
8. ToastContainer добавляет новый Toast в стек
      ?
9. Toast появляется с slide-in анимацией
    ?
10. Progress bar начинает уменьшаться
      ?
11. Через 5 сек автоматически закрывается с slide-out анимацией
```

## Поведение

### Когда dropdown ЗАКРЫТ
? Новое уведомление ? Toast появляется  
? Уведомление добавляется в store

### Когда dropdown ОТКРЫТ
? Новое уведомление ? Toast НЕ появляется  
? Уведомление добавляется в store  
? Пользователь видит его в списке

### Множественные toasts
```
Toast #1 (newest)    ? появился 0 сек назад
  ? 0.75rem gap
Toast #2  ? появился 2 сек назад
  ? 0.75rem gap
Toast #3    ? появился 4 сек назад
```

## Настройки

### Длительность отображения
```typescript
<Toast notification={n} onClose={close} duration={3000} /> // 3 секунды
```

### Позиция
Toast всегда появляется в правом верхнем углу (`fixed top-4 right-4`).

### Стилизация
- **Background:** Белый (светлая тема) / Серый-800 (темная тема)
- **Border:** Серый-200 / Серый-700
- **Shadow:** xl (увеличивается до 2xl при hover)
- **Type badge:** Синий
- **Subtype badge:** Фиолетовый
- **Progress bar:** Синий-500
- **Hover:** translateY(-2px) + scale(1.02)

## Тестирование

### Базовый тест
1. Запустите backend API
2. Откройте фронтенд приложение
3. Откройте консоль разработчика
4. Убедитесь что dropdown ЗАКРЫТ
5. Отправьте тестовое уведомление через `.http` файл
6. Проверьте логи:
   ```
   [NotificationStore] New SignalR notification received: {...}
 [NotificationStore] Showing toast notification
   [ToastContainer] Adding toast: {...}
   ```
7. ? Toast появляется в правом верхнем углу
8. ? Progress bar заполнен и начинает уменьшаться
9. ? Через 5 секунд toast автоматически закрывается

### Тест множественных toasts
1. Отправьте 3 уведомления подряд (с интервалом 1 сек)
2. ? Все 3 toast появляются в столбик
3. ? Новый toast всегда сверху
4. ? Отступы между toast = 0.75rem
5. ? Каждый toast независимо закрывается через 5 сек

### Тест с открытым dropdown
1. Откройте dropdown уведомлений
2. Отправьте уведомление
3. ? Toast НЕ появляется
4. ? Уведомление появляется в списке dropdown
5. Закройте dropdown
6. Отправьте уведомление
7. ? Toast появляется

## Отладка

### Проверить регистрацию callback

```typescript
// В консоли браузера
console.log(window.__showNotificationToast); // должна быть функция
```

### Проверить состояние dropdown

```typescript
// В консоли браузера через React DevTools
store.isDropdownOpen // должно быть false для показа toast
```

### Логи

Добавлены подробные логи:
- `[NotificationStore] New SignalR notification received`
- `[NotificationStore] Showing toast notification`
- `[NotificationStore] Toast not shown` (с причиной)
- `[NotificationDropdown] Toast callback registered`
- `[ToastContainer] Global toast function registered`
- `[ToastContainer] Adding toast`
- `[ToastContainer] Removing toast`

### Проверка стилей

Убедитесь что импортирован `./styles/toast.css`:
```css
/* в index.css */
@import './styles/toast.css';
```

## Известные ограничения

1. ? Toast не показывается при открытом dropdown (by design)
2. ? Максимум можно показать много toast одновременно (стек)
3. ? Позиция fixed - всегда в правом верхнем углу
4. ?? Длительность задается для каждого toast отдельно (нет глобальной настройки)
5. ?? На мобильных toast занимает всю ширину (responsive)

## Будущие улучшения

- [ ] Добавить настройки позиции toast (top/bottom, left/right)
- [ ] Добавить глобальную настройку длительности
- [ ] Добавить звуковые уведомления
- [ ] Добавить различные типы toast по важности (success, error, warning, info)
- [ ] Добавить кнопки действий в toast
- [ ] Добавить pause on hover (приостановка прогресса)
- [ ] Добавить queue management (максимум N toast одновременно)
- [ ] Добавить группировку похожих уведомлений
- [ ] Добавить desktop notifications API
- [ ] Добавить настройку анимации (slide/fade/bounce)

## Совместимость

- ? React 18+
- ? TypeScript 5+
- ? MobX 6+
- ? Tailwind CSS 3+
- ? Все современные браузеры (Chrome, Firefox, Safari, Edge)
- ? Mobile responsive
- ? Dark mode
- ? Accessibility (WCAG 2.1)

## Дополнительные файлы

### Новые файлы:
- ? `src/components/Toast.tsx` - компонент одного toast
- ? `src/components/ToastContainer.tsx` - контейнер для управления toast
- ? `src/styles/toast.css` - CSS анимации и стили

### Измененные файлы:
- ? `src/store/NotificationStore.ts` - добавлена поддержка toast
- ? `src/components/NotificationDropdown.tsx` - интегрирован ToastContainer
- ? `src/index.ts` - добавлены экспорты
- ? `src/index.css` - добавлен импорт стилей

## Визуальный пример

### Toast с прогресс-баром:
```
???????????????????????????????????
? [Task] [Task Assigned]      [X]?  ? Badges + Close button
?     ?
? New Task Assigned to You        ?  ? Title (bold)
?              ?
? Deploy new feature assigned     ?  ? Content (line-clamp-3)
? to you            ?
?      ?
? John Doe          Click to view??  ? Author + URL indicator
?               ?
? #task #urgent #work   ?  ? Hashtags (max 3)
???????????????????????????????????
? ????????????????????????????   ?  ? Progress bar (shrinking)
???????????????????????????????????
```

### Стек из 3 toast:
```
   ??????????????
       ?  Toast #1  ?  ? z-100, newest
 ??????????????
           ? 0.75rem
     ??????????????
       ?  Toast #2  ?  ? z-99
       ??????????????
   ? 0.75rem
       ??????????????
       ?  Toast #3  ?  ? z-98
       ??????????????

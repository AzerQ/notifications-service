# Toast Notifications - Changelog

## Версия 2.0 (10 января 2025)

### ? Новые возможности

#### Дизайн и UI
- ? **Прогресс-бар автозакрытия** - визуальный индикатор оставшегося времени
- ? **Badges для типа и подтипа** - синий badge для type, фиолетовый для subType
- ? **Отображение автора** - показывается имя автора уведомления
- ? **Хештеги** - отображение до 3 хештегов с красивым дизайном
- ? **Line-clamp** - автоматическое обрезание длинного текста (title: 2 строки, content: 3 строки)
- ? **Hover эффект** - поднимается вверх с масштабированием 1.02 и увеличенной тенью

#### Анимации
- ? **Slide-in справа** - плавное появление с прозрачностью и трансформацией
- ? **Slide-out справа** - плавное исчезновение с масштабированием 0.95
- ? **Progress bar animation** - плавное уменьшение полосы прогресса
- ? **Fade-in для badges** - мягкое появление элементов
- ? **Стек с z-index** - правильное наложение множественных toast

#### Функциональность
- ? **Стек в столбик** - toasts отображаются друг под другом с gap 0.75rem
- ? **Автоматическое добавление в store** - все новые уведомления попадают в список
- ? **Умное отображение** - toasts НЕ показываются при открытом dropdown
- ? **Логирование** - подробные логи для отладки
- ? **Глобальный API** - доступ через `window.__showNotificationToast`

#### Responsive и Accessibility
- ? **Mobile responsive** - на мобильных toast занимает всю ширину
- ? **Dark mode** - автоматическая поддержка темной темы
- ? **Reduced motion** - отключение анимаций для пользователей с ограничениями
- ? **Print styles** - toasts скрыты при печати
- ? **ARIA атрибуты** - role="alert", aria-live="polite"

### ?? Новые файлы

```
src/
??? components/
? ??? Toast.tsx  ? Обновлен с новым дизайном
?   ??? ToastContainer.tsx ? Обновлен с стеком
??? styles/
?   ??? toast.css       ? НОВЫЙ: CSS анимации
??? index.css            ? Обновлен: импорт toast.css
```

### ?? Измененные файлы

**Toast.tsx:**
- Добавлен прогресс-бар
- Добавлены badges для type и subType
- Добавлено отображение автора
- Добавлено отображение hashtags (до 3)
- Улучшены hover эффекты
- Добавлена анимация масштабирования

**ToastContainer.tsx:**
- Изменен layout на flex-col с gap-3
- Добавлено логирование
- Улучшена структура с правильным pointer-events

**toast.css:**
- Добавлены все CSS анимации
- Z-index управление для стека
- Responsive правила
- Dark mode поддержка
- Accessibility правила

### ?? Дизайн-система

#### Цвета
- **Type badge:** bg-blue-100 text-blue-800 (светлая) / bg-blue-900 text-blue-200 (темная)
- **Subtype badge:** bg-purple-100 text-purple-800 / bg-purple-900 text-purple-200
- **Hashtag:** bg-gray-100 text-gray-600 / bg-gray-700 text-gray-300
- **Progress bar:** bg-blue-500 (светлая) / bg-blue-400 (темная)

#### Размеры
- **Max width:** 24rem (384px)
- **Gap между toast:** 0.75rem (12px)
- **Padding:** 1rem (16px)
- **Border radius:** 0.5rem (8px)

#### Анимации
- **Duration:** 300ms
- **Easing:** ease-out (появление), ease-in (исчезновение)
- **Progress:** linear

### ?? Исправления

- ? Toasts теперь правильно отображаются в столбик
- ? Исправлено наложение toasts (z-index)
- ? Исправлена анимация закрытия
- ? Исправлен pointer-events для контейнера

### ?? Производительность

- ? CSS анимации (GPU accelerated)
- ? Мемоизация компонентов
- ? Оптимизированные re-renders
- ? Lazy loading для стилей

### ?? Отладка

Новые логи:
```
[ToastContainer] Global toast function registered
[ToastContainer] Adding toast: { id, notification }
[ToastContainer] Removing toast: id
[NotificationStore] Toast not shown: { hasCallback, isDropdownOpen }
```

### ?? Документация

- ? Обновлена `TOAST_NOTIFICATIONS.md` с новыми возможностями
- ? Добавлены визуальные примеры
- ? Добавлены инструкции по тестированию
- ? Добавлены troubleshooting советы

### ?? Roadmap

#### v2.1 (Планируется)
- [ ] Pause on hover (прогресс останавливается)
- [ ] Кнопки действий в toast
- [ ] Группировка похожих уведомлений
- [ ] Звуковые уведомления

#### v2.2 (Планируется)
- [ ] Настройка позиции (top/bottom, left/right)
- [ ] Разные типы по важности (success/error/warning/info)
- [ ] Queue management (max N toast одновременно)
- [ ] Desktop notifications API

#### v3.0 (Будущее)
- [ ] Customizable анимации
- [ ] Темы оформления
- [ ] Плагины и расширения
- [ ] React Native поддержка

### ?? Благодарности

Спасибо за использование notification-component-mvp!

---

**Changelog maintained by:** GitHub Copilot  
**Last update:** 10 января 2025

# Тесты для системы уведомлений

Данный проект содержит комплексную систему тестирования для всех компонентов системы уведомлений.

## Структура тестов

```
src/__tests__/
├── utils/
│   └── testUtils.tsx           # Вспомогательные функции для тестов
├── integration/
│   └── App.test.tsx           # Интеграционные тесты
├── Toast/
│   ├── ToastContainer.test.tsx
│   ├── ToastNotification.test.tsx
│   └── ToastProvider.test.tsx
├── Common.test.tsx            # Тесты утилитарных функций
├── CompactNotification.test.tsx
├── MaterialSelect.test.tsx
├── Modal.test.tsx
├── NotificationBell.test.tsx
├── NotificationCard.test.tsx
├── NotificationCenter.test.tsx
├── NotificationFilters.test.tsx
├── NotificationSidebar.test.tsx
├── NotificationSort.test.tsx
├── NotificationsBar.test.tsx
└── notificationsActions.test.tsx
```

## Покрытие тестами

Тесты покрывают следующие компоненты и функциональность:

### Основные компоненты
- ✅ **NotificationBell** - Кнопка колокольчика с счетчиком
- ✅ **NotificationSidebar** - Боковое меню с уведомлениями
- ✅ **NotificationCenter** - Центральный компонент управления
- ✅ **NotificationsBar** - Полная панель уведомлений
- ✅ **Modal** - Модальное окно

### Компоненты уведомлений
- ✅ **NotificationCard** - Полная карточка уведомления
- ✅ **CompactNotification** - Компактное уведомление для бокового меню
- ✅ **NotificationFilters** - Фильтры уведомлений
- ✅ **NotificationSort** - Сортировка уведомлений

### UI компоненты
- ✅ **MaterialSelect** - Кастомный селект
- ✅ **ToastProvider** - Провайдер для toast уведомлений
- ✅ **ToastContainer** - Контейнер toast уведомлений
- ✅ **ToastNotification** - Отдельное toast уведомление

### Логика и утилиты
- ✅ **notificationsActions** - Обработка действий уведомлений
- ✅ **Common** - Утилитарные функции
- ✅ **App** - Интеграционные тесты всего приложения

## Запуск тестов

### Запуск всех тестов
```bash
npm test
```

### Запуск тестов в режиме наблюдения
```bash
npm run test:watch
```

### Запуск тестов с покрытием
```bash
npm run test:coverage
```

### Запуск тестов для CI/CD
```bash
npm run test:ci
```

## Тестовые сценарии

### Функциональные тесты
- ✅ Отображение уведомлений
- ✅ Фильтрация и сортировка
- ✅ Поиск по уведомлениям
- ✅ Отметка как прочитанное/непрочитанное
- ✅ Добавление в избранное
- ✅ Выполнение действий уведомлений
- ✅ Сохранение и применение пресетов фильтров

### Интерактивные тесты
- ✅ Клики мышью
- ✅ Навигация клавиатурой
- ✅ Закрытие по Escape
- ✅ Клики вне компонента
- ✅ Hover эффекты

### Toast уведомления
- ✅ Отображение различных типов toast
- ✅ Автоматическое закрытие по таймеру
- ✅ Ручное закрытие
- ✅ Переключение позиции (верх/низ)
- ✅ Обработка действий при клике

### Accessibility тесты
- ✅ ARIA атрибуты
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader поддержка

### Responsive design
- ✅ Адаптивные сетки
- ✅ Мобильное отображение действий
- ✅ Breakpoint классы

## Мокирование

### Window API
- `window.open` - для тестирования открытия ссылок
- `window.matchMedia` - для responsive тестов
- `window.scrollTo` - для тестирования прокрутки

### DOM API
- `ResizeObserver` - для тестирования resize событий
- Event listeners - для тестирования событий клавиатуры и мыши

### Утилиты тестирования
- `mockNotifications` - Тестовые данные уведомлений
- `createMockNotification` - Создание mock уведомления
- `createMockToastFunction` - Mock функции для toast
- `waitFor` - Вспомогательная функция ожидания

## Конфигурация

### Jest настройки
- TypeScript поддержка через `ts-jest`
- jsdom environment для DOM тестирования
- CSS modules через `identity-obj-proxy`
- Setup файл для общих настроек

### Testing Library
- `@testing-library/react` для компонентного тестирования
- `@testing-library/user-event` для имитации пользовательских действий
- `@testing-library/jest-dom` для дополнительных матчеров

## Отчеты о покрытии

Тесты генерируют отчеты о покрытии в следующих форматах:
- **text** - в консоли
- **lcov** - для CI/CD интеграции
- **html** - детальный HTML отчет в `coverage/`

## Полезные команды

### Запуск конкретного теста
```bash
npm test -- NotificationBell
```

### Запуск тестов в определенной папке
```bash
npm test -- src/__tests__/Toast/
```

### Обновление снимков
```bash
npm test -- --updateSnapshot
```

### Отладка тестов
```bash
npm test -- --verbose
```

## CI/CD интеграция

Команда `npm run test:ci` оптимизирована для continuous integration:
- Отключает watch режим
- Генерирует отчеты покрытия
- Использует стабильные настройки

## Рекомендации по написанию новых тестов

1. **Именование**: Используйте описательные названия тестов на русском языке
2. **Структура**: Группируйте связанные тесты в `describe` блоки
3. **Cleanup**: Очищайте моки и состояние в `beforeEach`/`afterEach`
4. **Accessibility**: Всегда тестируйте доступность
5. **User Events**: Используйте `userEvent` вместо `fireEvent` где возможно
6. **Async**: Используйте `waitFor` для асинхронных операций

## Структура типичного теста

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    // пропсы по умолчанию
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать основные элементы', () => {
    render(<ComponentName {...defaultProps} />);
    
    expect(screen.getByText('Ожидаемый текст')).toBeInTheDocument();
  });

  it('должен обрабатывать пользовательские действия', async () => {
    const user = userEvent.setup();
    const mockCallback = jest.fn();
    
    render(<ComponentName {...defaultProps} onAction={mockCallback} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockCallback).toHaveBeenCalled();
  });
});
```
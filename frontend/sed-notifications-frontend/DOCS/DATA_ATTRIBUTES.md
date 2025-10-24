# Семантические Data Атрибуты для Тестирования

Этот документ описывает data-testid атрибуты, добавленные в компоненты системы уведомлений для удобства тестирования и автоматизации.

## Основное приложение (App.tsx)

### Структура страницы
- `data-testid="app-root"` - Корневой элемент приложения
- `data-testid="app-header"` - Заголовок страницы
- `data-testid="app-header-logo"` - Логотип/название в заголовке
- `data-testid="app-header-actions"` - Область действий в заголовке
- `data-testid="app-main-content"` - Основное содержимое страницы
- `data-testid="app-welcome-section"` - Приветственная секция
- `data-testid="app-features-info"` - Информация о функциях системы
- `data-testid="app-stats-section"` - Секция статистики

### Статистика уведомлений
- `data-testid="app-stats-total"` - Общее количество уведомлений
- `data-testid="app-stats-unread"` - Количество непрочитанных
- `data-testid="app-stats-starred"` - Количество избранных

## Центр уведомлений (NotificationCenter.tsx)

- `data-testid="notification-center"` - Контейнер центра уведомлений

## Колокольчик уведомлений (NotificationBell.tsx)

- `data-testid="notification-bell"` - Кнопка колокольчика
- `data-testid="notification-bell-icon"` - Иконка колокольчика
- `data-testid="notification-bell-badge"` - Счетчик непрочитанных уведомлений

## Боковое меню (NotificationSidebar.tsx)

### Структура
- `data-testid="notification-sidebar-overlay"` - Оверлей бокового меню
- `data-testid="notification-sidebar-backdrop"` - Фон для закрытия меню
- `data-testid="notification-sidebar"` - Само боковое меню

### Заголовок
- `data-testid="notification-sidebar-header"` - Заголовок бокового меню
- `data-testid="notification-sidebar-unread-count"` - Счетчик непрочитанных
- `data-testid="notification-sidebar-close-button"` - Кнопка закрытия

### Содержимое
- `data-testid="notification-sidebar-full-history-section"` - Секция кнопки "Вся история"
- `data-testid="notification-sidebar-full-history-button"` - Кнопка "Вся история"
- `data-testid="notification-sidebar-content"` - Основное содержимое
- `data-testid="notification-sidebar-empty-state"` - Пустое состояние
- `data-testid="notification-sidebar-list"` - Список уведомлений

### Подвал
- `data-testid="notification-sidebar-footer"` - Подвал бокового меню
- `data-testid="notification-sidebar-mark-all-read-button"` - Кнопка "Отметить все как прочитанные"

## Модальное окно (Modal.tsx)

- `data-testid="modal-overlay"` - Оверлей модального окна
- `data-testid="modal-backdrop"` - Фон для закрытия модального окна
- `data-testid="modal"` - Само модальное окно
- `data-testid="modal-header"` - Заголовок модального окна
- `data-testid="modal-close-button"` - Кнопка закрытия модального окна
- `data-testid="modal-content"` - Содержимое модального окна

## Компактное уведомление (CompactNotification.tsx)

### Основная структура
- `data-testid="compact-notification"` - Корневой элемент уведомления
- `data-notification-id` - ID уведомления
- `data-notification-type` - Тип уведомления
- `data-notification-subtype` - Подтип уведомления

### Элементы уведомления
- `data-testid="compact-notification-icon"` - Иконка уведомления
- `data-testid="compact-notification-content"` - Содержимое уведомления
- `data-testid="compact-notification-title"` - Заголовок уведомления
- `data-testid="compact-notification-description"` - Описание уведомления
- `data-testid="compact-notification-footer"` - Подвал уведомления
- `data-testid="compact-notification-time"` - Время уведомления
- `data-testid="compact-notification-link-indicator"` - Индикатор ссылки "Открыть →"
- `data-testid="compact-notification-unread-indicator"` - Индикатор непрочитанного

## Полная карточка уведомления (NotificationCard.tsx)

### Основная структура
- `data-testid="notification-card"` - Корневой элемент карточки
- `data-notification-id` - ID уведомления
- `data-notification-type` - Тип уведомления
- `data-notification-subtype` - Подтип уведомления
- `data-notification-read` - Статус прочтения
- `data-notification-starred` - Статус избранного

### Элементы карточки
- `data-testid="notification-card-icon"` - Иконка уведомления
- `data-testid="notification-card-content"` - Содержимое карточки
- `data-testid="notification-card-header"` - Заголовок карточки
- `data-testid="notification-card-title"` - Заголовок уведомления
- `data-testid="notification-card-actions"` - Действия в заголовке
- `data-testid="notification-card-delegate-badge"` - Значок делегирования
- `data-testid="notification-card-star-button"` - Кнопка избранного
- `data-testid="notification-card-type"` - Секция типа
- `data-testid="notification-card-subtype-badge"` - Значок подтипа
- `data-testid="notification-card-description"` - Описание уведомления
- `data-testid="notification-card-footer"` - Подвал карточки
- `data-testid="notification-card-metadata"` - Метаданные (автор, дата)
- `data-testid="notification-card-author"` - Автор уведомления
- `data-testid="notification-card-date"` - Дата уведомления
- `data-testid="notification-card-open-button"` - Кнопка "Открыть карточку"

### Действия
- `data-testid="notification-card-mobile-actions"` - Действия для мобильных
- `data-testid="notification-card-more-actions-button"` - Кнопка "Еще действия"
- `data-testid="notification-card-side-actions"` - Боковые действия
- `data-testid="notification-card-read-toggle-button"` - Кнопка переключения статуса прочтения
- `data-testid="notification-card-desktop-actions"` - Действия для десктопа

## Список уведомлений (NotificationsBar.tsx)

### Основная структура
- `data-testid="notifications-bar"` - Корневой элемент
- `data-testid="notifications-bar-controls"` - Секция управления
- `data-testid="notifications-bar-search-section"` - Секция поиска
- `data-testid="notifications-bar-search-input"` - Поле поиска
- `data-testid="notifications-bar-actions"` - Действия
- `data-testid="notifications-bar-unread-count"` - Счетчик непрочитанных
- `data-testid="notifications-bar-toggle-position-button"` - Кнопка смены позиции Toast
- `data-testid="notifications-bar-test-toasts-button"` - Кнопка тестовых Toast
- `data-testid="notifications-bar-content"` - Содержимое списка
- `data-testid="notifications-bar-empty-state"` - Пустое состояние

### Списки уведомлений
- `data-testid="notifications-list"` - Контейнер списка
- `data-section="starred"` / `data-section="regular"` - Тип секции
- `data-testid="notifications-list-title"` - Заголовок списка
- `data-testid="notifications-list-count"` - Счетчик в заголовке
- `data-testid="notifications-list-grid"` - Сетка уведомлений
- `data-testid="notifications-list-empty"` - Пустое состояние списка
- `data-testid="notifications-list-item"` - Элемент списка

## Фильтры (NotificationFilters.tsx)

- `data-testid="notification-filters"` - Контейнер фильтров
- `data-testid="notification-filters-container"` - Контейнер элементов фильтра
- `data-testid="notification-filters-type"` - Фильтр по типу
- `data-testid="notification-filters-subtype"` - Фильтр по подтипу
- `data-testid="notification-filters-status"` - Фильтр по статусу
- `data-testid="notification-filters-author"` - Фильтр по автору
- `data-testid="notification-filters-presets"` - Секция пресетов
- `data-testid="notification-filters-presets-toggle"` - Кнопка переключения пресетов
- `data-testid="notification-filters-presets-dropdown"` - Выпадающий список пресетов
- `data-testid="notification-filters-save-preset-button"` - Кнопка сохранения пресета
- `data-testid="notification-filters-preset-{index}"` - Конкретный пресет
- `data-preset-name` - Название пресета

## Сортировка (NotificationSort.tsx)

- `data-testid="notification-sort"` - Контейнер сортировки
- `data-testid="notification-sort-container"` - Контейнер элементов сортировки
- `data-testid="notification-sort-field"` - Поле сортировки
- `data-testid="notification-sort-order"` - Порядок сортировки

## Материальный селект (MaterialSelect.tsx)

- `data-testid="material-select"` - Контейнер селекта
- `data-testid="material-select-trigger"` - Триггер селекта
- `data-value` - Текущее значение
- `data-testid="material-select-value"` - Отображаемое значение
- `data-testid="material-select-chevron"` - Стрелка селекта
- `data-testid="material-select-dropdown"` - Выпадающий список
- `data-testid="material-select-option-{value}"` - Опция селекта
- `data-option-value` - Значение опции
- `data-option-label` - Отображаемый текст опции

## Toast уведомления

### Контейнер (ToastContainer.tsx)
- `data-testid="toast-container"` - Контейнер Toast
- `data-position` - Позиция контейнера (top/bottom)

### Уведомление (ToastNotification.tsx)
- `data-testid="toast-notification"` - Toast уведомление
- `data-toast-id` - ID Toast
- `data-toast-type` - Тип Toast
- `data-testid="toast-notification-icon"` - Иконка Toast
- `data-testid="toast-notification-content"` - Содержимое Toast
- `data-testid="toast-notification-title"` - Заголовок Toast
- `data-testid="toast-notification-message"` - Сообщение Toast
- `data-testid="toast-notification-close-button"` - Кнопка закрытия Toast

## Примеры использования в тестах

```javascript
// Поиск элементов по data-testid
const notificationBell = screen.getByTestId('notification-bell');
const sidebar = screen.getByTestId('notification-sidebar');
const compactNotification = screen.getByTestId('compact-notification');

// Поиск с дополнительными data атрибутами
const notification = screen.getByTestId('compact-notification');
expect(notification).toHaveAttribute('data-notification-id', '123');
expect(notification).toHaveAttribute('data-notification-type', 'task');

// Поиск по комбинации атрибутов
const starredNotifications = screen.getAllByTestId('notifications-list')[0];
expect(starredNotifications).toHaveAttribute('data-section', 'starred');

// Поиск конкретной опции в селекте
const typeOption = screen.getByTestId('material-select-option-task');
expect(typeOption).toHaveAttribute('data-option-value', 'task');
```

## Преимущества использования data атрибутов

1. **Стабильность тестов** - Тесты не зависят от изменений в CSS классах или тексте
2. **Семантическая ясность** - Атрибуты четко указывают назначение элемента
3. **Удобство автоматизации** - Легко использовать в E2E тестах и инструментах автоматизации
4. **Независимость от локализации** - Не зависят от изменений текста интерфейса
5. **Отладка** - Легко находить элементы в инструментах разработчика

## Рекомендации

1. Используйте `data-testid` для основной идентификации элементов
2. Добавляйте дополнительные data атрибуты для передачи контекстной информации
3. Следуйте соглашению об именовании: `{компонент}-{назначение}`
4. Добавляйте атрибуты для всех интерактивных элементов
5. Используйте описательные имена, отражающие назначение элемента
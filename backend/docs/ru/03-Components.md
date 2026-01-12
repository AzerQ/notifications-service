# Ключевые компоненты системы

Этот документ содержит описание основных компонентов сервиса уведомлений с акцентом на концепции и интерфейсы.

## Доменный слой (Domain Layer)

### Notification (Доменная модель)

Центральная сущность системы, представляющая уведомление.

**Ключевые свойства:**
- `Id` — уникальный идентификатор уведомления
- `Title` — заголовок уведомления
- `Message` — основное содержимое/текст уведомления
- `Route` — тип/маршрут уведомления (например, "UserRegistered")
- `CreatedAt` — дата и время создания
- `Recipient` — получатель уведомления (User)
- `Template` — связанный шаблон для форматирования
- `Metadata` — дополнительные метаданные в формате ключ-значение
- `DeliveryChannelsState` — статусы доставки по каналам

**Особенность:** Использует метод `ChannelsDefaultState()` для инициализации каналов доставки по умолчанию (Email и InApp).

### NotificationChannelDeliveryStatus

Статус доставки уведомления по конкретному каналу.

**Свойства:**
- `NotificationChannel` — канал доставки (Email, InApp)
- `DeliveryStatus` — статус доставки (Pending, Sent, Failed, Skipped)

### NotificationMetadataField

Метаданные уведомления в формате ключ-значение-описание.

**Использование:** Хранит дополнительные параметры, которые могут быть использованы в шаблонах или для аналитики.

### User

Модель пользователя-получателя уведомлений.

**Ключевые свойства:**
- `Id` — уникальный идентификатор пользователя
- `Name` — имя пользователя
- `Email` — email адрес для доставки
- `PhoneNumber` — номер телефона (опционально)
- `CreatedAt` — дата создания
- `DeviceToken` — токен устройства (опционально)
- `Role` — роль пользователя
- `AccountName` — имя учетной записи (для Windows Auth)

### NotificationTemplate

Шаблон для форматирования уведомлений.

**Свойства:**
- `Name` — уникальное имя шаблона
- `Subject` — тема/заголовок (Handlebars шаблон)
- `CommonContentTemplate` — общее содержимое (Handlebars шаблон)
- `ChannelsTemplates` — специфичные для каналов шаблоны

### UserRoutePreference

Предпочтения пользователя по маршрутам уведомлений.

**Использование:** Позволяет пользователям включать/отключать определенные типы уведомлений.

### Перечисления (Enums)

```csharp
// Каналы доставки уведомлений
public enum NotificationChannel
{
    Email,
    InApp
}

// Статусы доставки
public enum NotificationDeliveryStatus
{
    Pending,   // Ожидает отправки
    Sent,      // Успешно отправлено
    Failed,    // Ошибка отправки
    Skipped    // Пропущено (отключено пользователем)
}
```

### Интерфейсы репозиториев

#### INotificationRepository

Интерфейс для работы с уведомлениями в БД.

**Основные методы:**
- `GetNotificationByIdAsync(id)` — получить уведомление по ID
- `GetUserNotificationsAsync(userId, request)` — получить уведомления пользователя с фильтрацией и пагинацией
- `SaveNotifications(notifications)` — сохранить новые уведомления
- `UpdateNotifications(notifications)` — обновить существующие уведомления
- `MarkAllUserNotificationsAsRead(userId)` — пометить все уведомления пользователя как прочитанные

#### IUserRepository

Интерфейс для работы с пользователями.

**Основные методы:**
- `GetUserByIdAsync(id)` — получить пользователя по ID
- `GetUsersByIdsAync(ids)` — получить пользователей по списку ID
- `GetUserByEmailAsync(email)` — получить пользователя по email
- `GetByAccountNameAsync(accountName)` — получить пользователя по имени учетной записи
- `GetAllUsersAsync()` — получить всех пользователей
- `CreateUsersAync(users)` — создать пользователей

#### ITemplateRepository

Интерфейс для работы с шаблонами.

**Основные методы:**
- `GetTemplateByNameAsync(name)` — получить шаблон по имени
- `GetAllTemplatesAsync()` — получить все шаблоны

### Интерфейсы провайдеров

#### IEmailProvider

Интерфейс для отправки email уведомлений.

```csharp
Task<bool> SendEmailAsync(string to, string subject, string body, string? fromName = null, IEnumerable<NotificationFile>? files = null);
```

### NotificationRouteConfiguration

Класс конфигурации маршрута уведомления.

**Свойства:**
- `Name` — имя маршрута (например, "UserRegistered")
- `NotificationObjectKind` — тип объекта (User, Order, Task)
- `TemplateName` — имя шаблона
- `DisplayName` — отображаемое имя
- `Description` — описание
- `Tags` — теги
- `PayloadType` — тип данных полезной нагрузки
- `Icon` — иконка (Lucide)

## Прикладной слой (Application Layer)

### NotificationCommandService

Сервис для выполнения команд (создание и отправка уведомлений).

**Основной метод:**
- `ProcessNotificationRequestAsync(request)` — создание и отправка уведомления

**Процесс:**
1. Получить резолвер данных для маршрута
2. Получить конфигурацию маршрута
3. Получить шаблон
4. Маппинг и создание уведомлений
5. Сохранение в БД
6. Отправка по каналам
7. Возврат ответа

### NotificationQueryService

Сервис для выполнения запросов (чтение уведомлений).

**Основные методы:**
- `GetByIdAsync(id)` — получить уведомление по ID
- `GetUserNotifications(userId, request)` — получить уведомления пользователя (возвращает `AppNotification`)

### NotificationSender

Сервис оркестрации отправки уведомлений по различным каналам.

**Основной метод:**
- `SendAsync(notification)` — отправить уведомление

**Процесс:**
1. Валидация уведомления
2. Проверка пользовательских предпочтений
3. Отправка по всем активным каналам (параллельно)
4. Обновление статусов в БД

### NotificationRoutesContext

Реестр маршрутов уведомлений и их обработчиков.

**Функции:**
- `RegisterRoute(route, dataResolver, routeConfig)` — регистрация нового маршрута
- `GetDataResolverForRoute(route)` — получить резолвер для маршрута
- `GetNotificationRouteConfiguration(route)` — получить конфигурацию маршрута

**Использование:** Автоматически регистрирует все обработчики из сборки при запуске приложения.

### INotificationRoute

Интерфейс для обработчиков маршрутов уведомлений.

**Методы:**
- `ResolveNotificationRecipientsIds(request)` — получить ID получателей
- `ResolveNotificationFullData(request)` — подготовить полные данные для шаблона и URL

**Концепция:** Каждый тип уведомления реализует этот интерфейс, определяя логику сбора данных.

### NotificationMapper

Маппер для преобразования между доменными моделями и DTO.

**Основные методы:**
- `MapFromRequest(request, resolver, template)` — создать Notification из запроса
- `MapToResponse(notifications)` — преобразовать в DTO для API ответа

**Процесс маппинга:**
1. Получить получателей через резолвер
2. Для каждого получателя получить данные для шаблона
3. Рендеринг шаблона с данными
4. Создание объекта Notification
5. Определение каналов доставки

### DTO (Data Transfer Objects)

#### NotificationRequest

Входящий запрос на создание уведомления.

**Свойства:**
- `Route` — тип уведомления (в пути)
- `Title` — переопределение заголовка (опционально)
- `Message` — переопределение содержимого (опционально)
- `Channels` — массив каналов (опционально)
- `Parameters` — параметры для резолвера (в теле)

#### NotificationResponseDto

Ответ API с информацией об уведомлении.

**Свойства:**
- `Title` — заголовок
- `Route` — тип уведомления
- `CreatedAt` — дата создания
- `Recipients` — список получателей (UserDto)
- `CreatedNotificationIds` — ID созданных уведомлений
- `StatusMessage` — статусное сообщение

## Инфраструктурный слой (Infrastructure Layer)

### NotificationDbContext

EF Core контекст базы данных.

**DbSets:**
- `Notifications` — уведомления
- `Users` — пользователи
- `NotificationTemplates` — шаблоны
- `NotificationMetadataFields` — метаданные
- `NotificationChannelDeliveryStatuses` — статусы доставки
- `UserRoutePreferences` — предпочтения пользователей

**Конфигурация:** Использует Fluent API для настройки отношений и ограничений.

### Репозитории

Реализации интерфейсов репозиториев из Domain слоя:
- `NotificationRepository` — работа с уведомлениями
- `UserRepository` — работа с пользователями
- `TemplateRepository` — работа с шаблонами
- `UserRoutePreferenceRepository` — работа с предпочтениями

### SmtpEmailProvider

Реализация отправки email через SMTP.

**Концепция:** Использует фабрику `SmtpClientFactory` для создания SMTP клиентов, что позволяет легко переключаться между реальным SMTP и mock реализациями для тестирования.

**Конфигурация:**
- `SmtpHost` — адрес SMTP сервера
- `SmtpPort` — порт SMTP
- `EnableSsl` — использовать SSL
- `UserName` — имя пользователя
- `Password` — пароль
- `FromAddress` — адрес отправителя
- `FromName` — имя отправителя

### HandlebarsTemplateRenderer

Рендеринг шаблонов с использованием Handlebars.NET.

**Особенности:**
- Поддержка условных блоков (`{{#if}}...{{/if}}`)
- Поддержка итерации (`{{#each}}...{{/each}}`)
- Регистрация кастомных helpers для форматирования

**Примеры helpers:**
- `formatDate` — форматирование даты
- `uppercase` — преобразование в верхний регистр
- `ifEquals` — условное отображение

### FileSystemTemplateProvider

Загрузка шаблонов из файловой системы.

**Структура:**
```
Templates/
├── UserRegistered/
│   ├── UserRegistered.hbs
│   └── template.json
├── OrderCreated/
│   ├── OrderCreated.hbs
│   └── template.json
└── TaskAssigned/
    ├── TaskAssigned.hbs
    └── template.json
```

## API слой (API Layer)

### NotificationController

Контроллер REST API для работы с уведомлениями.

**Основные endpoints:**
- `POST /api/notification/{route}` — создать и отправить уведомление
- `GET /api/notification/{id}` — получить уведомление по ID
- `GET /api/notification/personal` — получить уведомления текущего пользователя
- `PUT /api/notification/personal/mark-all-read` — пометить все как прочитанные
- `PUT /api/notification/set-read-flag` — установить флаг прочтения
- `POST /api/notification/broadcast` — транслировать уведомление через SignalR

### NotificationHub

SignalR Hub для real-time уведомлений.

**Методы:**
- `BroadcastNotification(notification)` — отправить всем подключенным клиентам
- `SendInAppNotificationToUser(userId, notification)` — отправить конкретному пользователю

**События:**
- `ReceiveNotification` — событие, которое получают клиенты

## Обработчики уведомлений (Test Handlers)

### Структура обработчика

Каждый обработчик состоит из:

1. **Route Handler** — реализует `INotificationRoute`
   - `RouteConfiguration` — свойство с настройками маршрута
   - `ResolveNotificationRecipientsIds` — определяет получателей
   - `ResolveNotificationFullData` — подготавливает данные для шаблона

3. **HTML Template** (`.hbs`) — Handlebars шаблон
   - Содержит HTML структуру уведомления
   - Использует переменные из резолвера

4. **Template Config** (`template.json`) — метаданные шаблона
   - Имя шаблона
   - Тема письма
   - Описание
   - Версия

### Примеры обработчиков

**UserRegistered** — приветственное уведомление при регистрации
- Получает пользователя по UserId
- Подготавливает данные: имя, email, дату регистрации
- Использует шаблон с приветственным сообщением

**OrderCreated** — подтверждение заказа
- Получает информацию о заказе
- Подготавливает данные: номер заказа, сумму, количество товаров
- Использует шаблон с деталями заказа

**TaskAssigned** — уведомление о назначении задачи
- Получает информацию о задаче и исполнителе
- Подготавливает данные: название, описание, приоритет, дедлайн
- Использует шаблон с деталями задачи

## Следующие шаги

1. Изучите [API документацию](./04-API.md) для работы с сервисом
2. Ознакомьтесь с [Frontend компонентами](./05-Frontend.md)
3. Прочитайте [Руководство разработчика](./06-Development-Guide.md) для добавления новых обработчиков

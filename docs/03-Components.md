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

**Особенность:** Использует метод `ChannelsDefaultState()` для инициализации каналов доставки по умолчанию (Email и Push).

### NotificationChannelDeliveryStatus

Статус доставки уведомления по конкретному каналу.

**Свойства:**
- `NotificationChannel` — канал доставки (Email, SMS, Push)
- `DeliveryStatus` — статус доставки (Pending, Sent, Failed, Skipped)

### NotificationMetadataField

Метаданные уведомления в формате ключ-значение-описание.

**Использование:** Хранит дополнительные параметры, которые могут быть использованы в шаблонах или для аналитики.

### User

Модель пользователя-получателя уведомлений.

**Ключевые свойства:**
- `Id` — уникальный идентификатор пользователя
- `Username` — имя пользователя
- `Email` — email адрес для доставки
- `PhoneNumber` — номер телефона для SMS (опционально)
- `DeviceToken` — токен устройства для Push (опционально)

### NotificationTemplate

Шаблон для форматирования уведомлений.

**Свойства:**
- `Name` — уникальное имя шаблона
- `Subject` — тема/заголовок
- `Content` — содержимое (Handlebars шаблон)

### UserRoutePreference

Предпочтения пользователя по маршрутам уведомлений.

**Использование:** Позволяет пользователям включать/отключать определенные типы уведомлений.

### Перечисления (Enums)

```csharp
// Каналы доставки уведомлений
public enum NotificationChannel
{
    Email,
    Sms,
    Push
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
- `GetNotificationsForUserAsync(userId)` — получить все уведомления пользователя
- `GetNotificationsByStatusAsync(status)` — получить уведомления по статусу
- `SaveNotificationsAsync(notifications)` — сохранить новые уведомления
- `UpdateNotificationsAsync(notifications)` — обновить существующие уведомления

#### IUserRepository

Интерфейс для работы с пользователями.

**Основные методы:**
- `GetUserByIdAsync(id)` — получить пользователя по ID
- `GetAllUsersAsync()` — получить всех пользователей
- `SaveUsersAsync(users)` — сохранить пользователей

#### ITemplateRepository

Интерфейс для работы с шаблонами.

**Основные методы:**
- `GetTemplateByNameAsync(name)` — получить шаблон по имени
- `GetAllTemplatesAsync()` — получить все шаблоны

### Интерфейсы провайдеров

#### IEmailProvider

Интерфейс для отправки email уведомлений.

```csharp
Task<bool> SendEmailAsync(string to, string subject, string body);
```

#### ISmsProvider

Интерфейс для отправки SMS уведомлений (для расширения).

```csharp
Task<bool> SendSmsAsync(string phoneNumber, string message);
```

#### IPushNotificationProvider

Интерфейс для отправки Push-уведомлений (для расширения).

```csharp
Task<bool> SendPushNotificationAsync(string deviceToken, string title, string body);
```

### INotificationRouteConfiguration

Интерфейс конфигурации маршрута уведомления.

**Свойства:**
- `RouteName` — имя маршрута (например, "UserRegistered")
- `TemplateName` — имя шаблона для этого маршрута
- `DefaultChannels` — каналы доставки по умолчанию

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
- `GetByUserAsync(userId)` — получить уведомления пользователя
- `GetByStatusAsync(status)` — получить уведомления по статусу

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

### INotificationDataResolver

Интерфейс для резолверов данных уведомлений.

**Методы:**
- `ResolveRecipientsAsync(parameters)` — получить список получателей
- `ResolveTemplateDataAsync(recipient, parameters)` — подготовить данные для шаблона

**Концепция:** Каждый тип уведомления имеет свой резолвер, который знает, как получить данные из различных источников.

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
- `Route` — тип уведомления (обязательно)
- `Channel` — каналы доставки (опционально, по умолчанию все)
- `Parameters` — параметры для резолвера и шаблона

#### NotificationResponseDto

Ответ API с информацией об уведомлении.

**Свойства:**
- `Id` — идентификатор уведомления
- `Title` — заголовок
- `Message` — содержимое
- `Route` — тип уведомления
- `CreatedAt` — дата создания
- `Recipient` — информация о получателе
- `ChannelStatuses` — статусы доставки по каналам

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
- `POST /api/notification` — создать и отправить уведомление
- `GET /api/notification/{id}` — получить уведомление по ID
- `GET /api/notification/by-user/{userId}` — получить уведомления пользователя
- `GET /api/notification/by-status/{status}` — получить уведомления по статусу
- `POST /api/notification/broadcast` — транслировать уведомление через SignalR

### NotificationHub

SignalR Hub для real-time уведомлений.

**Методы:**
- `BroadcastNotification(notification)` — отправить всем подключенным клиентам
- `SendToUser(userId, notification)` — отправить конкретному пользователю

**События:**
- `ReceiveNotification` — событие, которое получают клиенты

## Обработчики уведомлений (Test Handlers)

### Структура обработчика

Каждый обработчик состоит из:

1. **Data Resolver** — реализует `INotificationDataResolver`
   - Получает данные получателей по параметрам запроса
   - Подготавливает данные для рендеринга шаблона

2. **Route Configuration** — реализует `INotificationRouteConfiguration`
   - Определяет имя маршрута
   - Указывает имя шаблона
   - Определяет каналы доставки по умолчанию

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

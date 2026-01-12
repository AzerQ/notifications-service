# Архитектура системы

## Общая архитектура

Проект организован по принципам **Clean Architecture** (Чистая архитектура) с четким разделением ответственности между слоями.

### Диаграмма высокого уровня

```mermaid
graph TD
    subgraph Presentation_Layer ["Слой представления"]
        REST["REST API контроллеры"]
        SIGNALR["SignalR Hub (Real-time)"]
    end

    subgraph Application_Layer ["Прикладной слой"]
        APP_SERVICES["Сервисы команд и запросов"]
        SENDER["Отправитель уведомлений"]
        APP_SUPPORT["Резолверы данных и мапперы"]
    end

    subgraph Domain_Layer ["Доменный слой"]
        DOMAIN["Модели, интерфейсы и валидаторы"]
    end

    subgraph Infrastructure_Layer ["Инфраструктурный слой"]
        EF_CORE["EF Core репозитории"]
        EMAIL["Email провайдер (SMTP)"]
        TEMPLATE["Рендерер шаблонов"]
    end

    subgraph External_Systems ["Внешние системы"]
        DB[("SQLite БД")]
        SMTP["SMTP сервер"]
    end

    REST --> APP_SERVICES
    SIGNALR --> APP_SERVICES
    APP_SERVICES --> SENDER
    APP_SERVICES --> APP_SUPPORT
    APP_SUPPORT --> DOMAIN
    SENDER --> DOMAIN
    DOMAIN --> EF_CORE
    DOMAIN --> EMAIL
    DOMAIN --> TEMPLATE
    EF_CORE --> DB
    EMAIL --> SMTP

    style Presentation_Layer fill:#e1f5fe,stroke:#01579b
    style Application_Layer fill:#f3e5f5,stroke:#4a148c
    style Domain_Layer fill:#e8f5e9,stroke:#1b5e20
    style Infrastructure_Layer fill:#fff3e0,stroke:#e65100
    style External_Systems fill:#f1f8e9,stroke:#33691e
```

Система состоит из 4 основных слоев:

1. **Presentation Layer** — REST API контроллеры и SignalR Hub
2. **Application Layer** — бизнес-логика и оркестрация
3. **Domain Layer** — доменные модели и интерфейсы
4. **Infrastructure Layer** — реализация доступа к данным и внешним сервисам

## Многослойная структура

### 1. NotificationService.Domain (Доменный слой)

**Ответственность:** Содержит бизнес-логику, доменные модели и интерфейсы.

**Не зависит от других слоев** (кроме BCL).

**Основные компоненты:**
- **Модели:** `Notification`, `User`, `NotificationTemplate`, `UserRoutePreference`
- **Перечисления:** `NotificationChannel`, `NotificationDeliveryStatus`
- **Интерфейсы репозиториев:** `INotificationRepository`, `IUserRepository`, `ITemplateRepository`
- **Интерфейсы провайдеров:** `IEmailProvider`, `ISmsProvider`, `IPushNotificationProvider`
- **Конфигурационные интерфейсы:** `INotificationRouteConfiguration`

#### Диаграмма доменного слоя

```mermaid
classDiagram
    class Notification {
        +Guid Id
        +string Title
        +string Message
        +string Route
        +DateTime CreatedAt
        +User Recipient
        +NotificationTemplate Template
        +List~NotificationMetadataField~ Metadata
        +List~NotificationChannelDeliveryStatus~ DeliveryChannelsState
    }

    class User {
        +Guid Id
        +string Username
        +string Email
        +string? PhoneNumber
        +string? DeviceToken
    }

    class NotificationTemplate {
        +Guid Id
        +string Name
        +string Subject
        +string Content
    }

    class NotificationMetadataField {
        +Guid Id
        +string Key
        +string Value
        +string? Description
    }

    class NotificationChannelDeliveryStatus {
        +Guid Id
        +NotificationChannel Channel
        +NotificationDeliveryStatus Status
    }

    class UserRoutePreference {
        +Guid Id
        +Guid UserId
        +string Route
        +bool IsEnabled
    }

    class NotificationChannel {
        <<enumeration>>
        Email
        Sms
        Push
    }

    class NotificationDeliveryStatus {
        <<enumeration>>
        Pending
        Sent
        Failed
        Skipped
    }

    Notification --> User
    Notification --> NotificationTemplate
    Notification --> NotificationMetadataField
    Notification --> NotificationChannelDeliveryStatus
    NotificationChannelDeliveryStatus --> NotificationChannel
    NotificationChannelDeliveryStatus --> NotificationDeliveryStatus
    UserRoutePreference --> User
```

### 2. NotificationService.Application (Прикладной слой)

**Ответственность:** Координирует выполнение бизнес-сценариев (use cases).

**Зависит от:** Domain

**Основные компоненты:**
- **Сервисы:** `NotificationCommandService`, `NotificationQueryService`, `NotificationSender`
- **Маршруты:** `NotificationRoutesContext` — реестр обработчиков уведомлений
- **Резолверы данных:** `INotificationDataResolver` — получение данных для уведомлений
- **Маппинг:** `NotificationMapper` — преобразование между моделями и DTO
- **DTO:** `NotificationRequest`, `NotificationResponseDto`, `UserDto`

#### Диаграмма прикладного слоя

```mermaid
classDiagram
    class NotificationCommandService {
        +ProcessNotificationRequestAsync(request) Task
    }

    class NotificationQueryService {
        +GetByIdAsync(id) Task
        +GetByUserAsync(userId) Task
        +GetByStatusAsync(status) Task
    }

    class NotificationSender {
        +SendAsync(notification) Task
    }

    class NotificationRoutesContext {
        +RegisterRoute(route, resolver, config)
        +GetDataResolverForRoute(route) INotificationDataResolver
        +GetNotificationRouteConfiguration(route) INotificationRouteConfiguration
    }

    class NotificationMapper {
        +MapFromRequest(request, resolver, template) Task
        +MapToResponse(notifications) NotificationResponseDto
    }

    class INotificationDataResolver {
        <<interface>>
        +ResolveRecipientsAsync(parameters) Task
        +ResolveTemplateDataAsync(recipient, parameters) Task
    }

    NotificationCommandService --> NotificationRoutesContext
    NotificationCommandService --> NotificationSender
    NotificationCommandService --> NotificationMapper
    NotificationSender --> INotificationDataResolver
```

### 3. NotificationService.Infrastructure (Инфраструктурный слой)

**Ответственность:** Реализует интерфейсы для работы с внешними системами.

**Зависит от:** Domain, Application (частично)

**Основные компоненты:**
- **EF Core:** `NotificationDbContext`, конфигурации сущностей
- **Репозитории:** `NotificationRepository`, `UserRepository`, `TemplateRepository`
- **Email провайдер:** `SmtpEmailProvider`, `SmtpClientFactory`
- **Рендеринг шаблонов:** `HandlebarsTemplateRenderer`, `FileSystemTemplateProvider`
- **Инициализация БД:** `DbInitializer`, миграции

#### Диаграмма инфраструктурного слоя

```mermaid
graph LR
    subgraph Data_Access ["Доступ к данным"]
        DB_CONTEXT["NotificationDbContext"]
        REPO["Репозитории"]
    end

    subgraph Providers ["Внешние провайдеры"]
        SMTP["SmtpEmailProvider"]
        TEMPLATE["HandlebarsTemplateRenderer"]
    end

    REPO --> DB_CONTEXT
    DB_CONTEXT --> SQLITE[("SQLite БД")]
    SMTP --> SMTP_SERVER["SMTP сервер"]
```

### 4. NotificationService.Api (API слой)

**Ответственность:** Точка входа в приложение, веб-сервер, контроллеры, DI-композиция.

**Зависит от:** Application, Infrastructure

**Основные компоненты:**
- **Контроллеры:** `NotificationController`, `UsersController`, `UserRoutePreferencesController`
- **SignalR Hub:** `NotificationHub` для real-time уведомлений
- **Middleware:** `ErrorHandlingMiddleware` для обработки ошибок
- **DI конфигурация:** регистрация всех сервисов

#### Диаграмма API слоя

```mermaid
graph TD
    subgraph Controllers ["Контроллеры"]
        NC["NotificationController"]
        UC["UsersController"]
        URPC["UserRoutePreferencesController"]
    end

    subgraph RealTime ["Real-time"]
        HUB["NotificationHub (SignalR)"]
    end

    NC --> APP["Прикладные сервисы"]
    UC --> REPO["Репозитории"]
    URPC --> REPO
    HUB --> APP
```

### 5. NotificationService.TestHandlers (Тестовые обработчики)

**Ответственность:** Содержит примеры обработчиков уведомлений.

**Зависит от:** Domain, Application

**Структура обработчика:**
```
MyNotification/
├── MyNotificationDataResolver.cs      # Резолвер данных
├── MyNotificationRouteConfig.cs       # Конфигурация маршрута
├── MyNotification.hbs                 # HTML шаблон
└── template.json                      # Метаданные шаблона
```

**Примеры обработчиков:**
- `UserRegistered` — регистрация пользователя
- `OrderCreated` — создание заказа
- `TaskAssigned` — назначение задачи

## Взаимодействие слоев

### Правила зависимостей

1. **Domain** не зависит ни от кого
2. **Application** зависит только от **Domain**
3. **Infrastructure** зависит от **Domain** (и частично от **Application**)
4. **Api** зависит от **Application** и **Infrastructure**
5. **TestHandlers** зависит от **Domain** and **Application**

### Поток данных (вертикальный срез)

```mermaid
sequenceDiagram
    participant Client as HTTP клиент
    participant Controller as NotificationController
    participant CommandService as NotificationCommandService
    participant RoutesContext as NotificationRoutesContext
    participant DataResolver as INotificationDataResolver
    participant Mapper as NotificationMapper
    participant Repository as INotificationRepository
    participant Sender as NotificationSender
    participant EmailProvider as IEmailProvider

    Client->>Controller: 1. POST /api/notification (NotificationRequest)
    activate Controller
    
    Controller->>CommandService: 2. ProcessNotificationRequestAsync(request)
    activate CommandService
    
    CommandService->>RoutesContext: 3. GetDataResolverForRoute(route)
    activate RoutesContext
    RoutesContext-->>CommandService: Экземпляр DataResolver
    deactivate RoutesContext
    
    CommandService->>RoutesContext: 4. GetNotificationRouteConfiguration(route)
    activate RoutesContext
    RoutesContext-->>CommandService: Конфигурация маршрута
    deactivate RoutesContext
    
    CommandService->>Mapper: 5. MapFromRequest(request, resolver, template)
    activate Mapper
    
    Mapper->>DataResolver: 6. ResolveRecipientsAsync(parameters)
    activate DataResolver
    DataResolver-->>Mapper: List<User>
    deactivate DataResolver
    
    Mapper->>DataResolver: 7. ResolveTemplateDataAsync(recipient, parameters)
    activate DataResolver
    DataResolver-->>Mapper: Dictionary<string, object>
    deactivate DataResolver
    
    Mapper-->>CommandService: 8. List<Notification>
    deactivate Mapper
    
    CommandService->>Repository: 9. SaveNotificationsAsync(notifications)
    activate Repository
    Repository-->>CommandService: Сохранено
    deactivate Repository
    
    CommandService->>Sender: 10. SendAsync(notification)
    activate Sender
    
    Sender->>EmailProvider: 11. SendEmailAsync(to, subject, body)
    activate EmailProvider
    EmailProvider-->>Sender: true/false
    deactivate EmailProvider
    
    Sender->>Repository: 12. UpdateNotificationsAsync(notification)
    activate Repository
    Repository-->>Sender: Обновлено
    deactivate Repository
    
    Sender-->>CommandService: Завершено
    deactivate Sender
    
    CommandService-->>Controller: 13. NotificationResponseDto
    deactivate CommandService
    
    Controller-->>Client: 14. 200 OK + Ответ
    deactivate Controller
```

**Основные этапы:**
1. HTTP запрос поступает в контроллер
2. Контроллер передает запрос в CommandService
3. CommandService получает резолвер данных из NotificationRoutesContext
4. Резолвер определяет получателей и подготавливает данные
5. Mapper создает объекты Notification с рендеринговым шаблоном
6. Уведомления сохраняются в БД
7. NotificationSender отправляет по всем активным каналам
8. Статусы доставки обновляются в БД
9. Ответ возвращается клиенту

## Ключевые компоненты системы

### NotificationRoutesContext

Центральный реестр маршрутов уведомлений и их обработчиков.

**Функции:**
- Регистрация новых маршрутов уведомлений
- Получение резолвера данных по маршруту
- Получение конфигурации маршрута

### NotificationSender

Сервис оркестрации отправки уведомлений по различным каналам.

**Функции:**
- Валидация уведомления
- Проверка пользовательских предпочтений
- Отправка по всем активным каналам
- Обновление статусов доставки

### INotificationDataResolver

Интерфейс для резолверов данных уведомлений.

**Ответственность:**
- Получение данных получателей по параметрам запроса
- Обогащение уведомления данными для шаблона

### Провайдеры каналов доставки

Реализации для различных каналов:
- `IEmailProvider` / `SmtpEmailProvider` — Email через SMTP
- `ISmsProvider` — SMS (интерфейс для расширения)
- `IPushNotificationProvider` — Push-уведомления (интерфейс для расширения)

### Template System

Система шаблонов для форматирования уведомлений.

**Компоненты:**
- `ITemplateRenderer` — интерфейс рендеринга
- `HandlebarsTemplateRenderer` — реализация на Handlebars
- `FileSystemTemplateProvider` — загрузка шаблонов из файловой системы
- `TemplateRepository` — хранилище шаблонов

## Паттерны проектирования

### Repository Pattern
Абстракция доступа к данным через интерфейсы репозиториев.

### Dependency Injection
Все зависимости внедряются через конструкторы и регистрируются в DI-контейнере.

### Strategy Pattern
Различные провайдеры доставки реализуют общий интерфейс.

### Command/Query Separation
Разделение команд (изменение состояния) и запросов (чтение данных).

### Factory Pattern
`SmtpClientFactory` для создания SMTP клиентов.

## SignalR интеграция

### NotificationHub

SignalR Hub для real-time уведомлений.

**Методы:**
- `BroadcastNotification(notification)` — рассылка всем подключенным клиентам
- `SendToUser(userId, notification)` — отправка конкретному пользователю

**Подключение:**
```
URL: /notificationHub
Events: ReceiveNotification
```

## База данных

### Схема БД (SQLite)

**Таблицы:**
- `Notifications` — основная таблица уведомлений
- `Users` — пользователи
- `NotificationTemplates` — шаблоны уведомлений
- `NotificationMetadataFields` — метаданные уведомлений (ключ-значение)
- `NotificationChannelDeliveryStatuses` — статусы доставки по каналам
- `UserRoutePreferences` — предпочтения пользователей по маршрутам

### Миграции

Entity Framework Core используется для создания и применения миграций базы данных.

## Конфигурация

Конфигурация приложения осуществляется через:
- `appsettings.json` — базовые настройки
- `appsettings.Development.json` — настройки для разработки
- Переменные окружения — для production

**Основные секции:**
- `ConnectionStrings:Notifications` — строка подключения к БД
- `Email` — настройки SMTP
- `TemplateOptions` — пути к шаблонам

## Безопасность

### Валидация
- Валидация данных на уровне Domain
- Проверка входных данных в контроллерах

### Обработка ошибок
- `ErrorHandlingMiddleware` для централизованной обработки исключений
- Логирование ошибок

### CORS
- Настраиваемая политика CORS для frontend приложений

## Расширяемость

Система спроектирована для легкого расширения:

1. **Новые типы уведомлений** — добавить `INotificationDataResolver` и `INotificationRouteConfiguration`
2. **Новые каналы доставки** — реализовать интерфейс провайдера и зарегистрировать в DI
3. **Новые источники данных** — добавить репозиторий или провайдер
4. **Новые шаблоны** — добавить `.hbs` файл и `template.json`

## Следующие шаги

1. Изучите [Ключевые компоненты](./03-Components.md) подробнее
2. Ознакомьтесь с [API](./04-API.md)
3. Прочитайте [Руководство разработчика](./06-Development-Guide.md) для добавления функциональности

# UML Диаграммы архитектуры

Этот каталог содержит PlantUML диаграммы, которые визуализируют архитектуру Notifications Service.

## Диаграммы

### 1. OVERALL_ARCHITECTURE.puml
**Общая архитектура системы**

Показывает высокоуровневую структуру приложения с четырьмя основными слоями:
- Presentation Layer (REST API, SignalR Hub)
- Application Layer (Services, Mappers, Data Resolvers)
- Domain Layer (Models, Interfaces, Validators)
- Infrastructure Layer (EF Core, Providers, Templates)

**Используйте для:** Понимания общей структуры проекта и взаимодействия между слоями.

---

### 2. DOMAIN_LAYER.puml
**Доменный слой - ядро бизнес-логики**

Детальная диаграмма доменного слоя, включающая:
- **Models:** Notification, User, NotificationTemplate, NotificationMetadataField, NotificationChannelDeliveryStatus, UserRoutePreference
- **Enums:** NotificationChannel, NotificationDeliveryStatus
- **Interfaces:** INotificationRepository, IUserRepository, ITemplateRepository, IEmailProvider, ISmsProvider, IPushNotificationProvider, INotificationRouteConfiguration

**Используйте для:** Понимания доменных моделей и их взаимосвязей, а также интерфейсов, которые должны быть реализованы в других слоях.

---

### 3. APPLICATION_LAYER.puml
**Прикладной слой - оркестрация бизнес-сценариев**

Диаграмма прикладного слоя, показывающая:
- **Services:** NotificationCommandService, NotificationQueryService, NotificationSender
- **Routing:** NotificationRoutesContext
- **Mappers:** NotificationMapper и интерфейс INotificationMapper
- **Interfaces:** INotificationCommandService, INotificationQueryService, INotificationSender, INotificationDataResolver, ITemplateRenderer
- **DTOs:** NotificationRequest, NotificationResponseDto, UserDto, ChannelStatusDto

**Используйте для:** Понимания того, как сервисы координируют выполнение бизнес-сценариев и как данные преобразуются между слоями.

---

### 4. INFRASTRUCTURE_LAYER.puml
**Инфраструктурный слой - доступ к данным и внешним сервисам**

Диаграмма инфраструктурного слоя, включающая:
- **Data Access:** NotificationDbContext, репозитории (NotificationRepository, UserRepository, TemplateRepository, UserRoutePreferenceRepository)
- **Email Provider:** SmtpEmailProvider, SmtpClientFactory, SmtpClientWrapper, EmailProviderOptions
- **Template Rendering:** HandlebarsTemplateRenderer, FileSystemTemplateProvider, TemplateOptions
- **Database:** SQLite DB

**Используйте для:** Понимания того, как реализуется доступ к данным и как интегрируются внешние сервисы (SMTP, файловая система).

---

### 5. API_LAYER.puml
**API слой - точка входа в приложение**

Диаграмма API слоя, показывающая:
- **Controllers:** NotificationController, UsersController, UserRoutePreferencesController
- **SignalR:** NotificationHub
- **Middleware:** ErrorHandlingMiddleware
- **DI & Configuration:** NotificationServiceDiConfigurationExtensions, NotificationDocumentFilter
- **HTTP Models:** NotificationRequest, NotificationResponseDto, BroadcastRequest

**Используйте для:** Понимания REST API endpoints и SignalR интеграции.

---

### 6. DATA_FLOW.puml
**Поток данных при обработке уведомления**

Диаграмма последовательности (sequence diagram), показывающая полный процесс обработки уведомления:

1. HTTP запрос поступает в контроллер
2. Контроллер передает запрос в CommandService
3. CommandService получает резолвер данных из NotificationRoutesContext
4. Резолвер определяет получателей и подготавливает данные
5. Mapper создает объекты Notification с рендеринговым шаблоном
6. Уведомления сохраняются в БД
7. NotificationSender отправляет по всем активным каналам
8. Статусы доставки обновляются в БД
9. Ответ возвращается клиенту

**Используйте для:** Понимания полного цикла обработки уведомления от запроса до ответа.

---

## Как использовать диаграммы

### Просмотр в PlantUML редакторе

1. Перейдите на [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Скопируйте содержимое файла `.puml`
3. Вставьте в редактор
4. Диаграмма отобразится автоматически

### Интеграция в документацию

Диаграммы уже интегрированы в основные документы:
- [02-Architecture.md](../02-Architecture.md) — содержит ссылки на все диаграммы
- [03-Components.md](../03-Components.md) — ссылается на диаграммы слоев

### Экспорт диаграмм

Вы можете экспортировать диаграммы в различные форматы:
- PNG
- SVG
- PDF

Используйте PlantUML CLI или онлайн редактор для экспорта.

---

## Структура диаграмм

Все диаграммы используют:
- **Цветовую схему** для различия слоев:
  - Presentation Layer: #E1F5FE (голубой)
  - Application Layer: #F3E5F5 (фиолетовый)
  - Domain Layer: #E8F5E9 (зеленый)
  - Infrastructure Layer: #FFF3E0 (оранжевый)
  - External Systems: #F1F8E9 (светло-зеленый)

- **Стандартные элементы:**
  - `class` — классы и интерфейсы
  - `interface` — интерфейсы (с `<<interface>>`)
  - `enum` — перечисления
  - `package` — логические группы компонентов
  - `database` — внешние системы (БД, SMTP и т.д.)

---

## Обновление диаграмм

При изменении архитектуры:

1. Обновите соответствующий файл `.puml`
2. Проверьте диаграмму в PlantUML редакторе
3. Обновите связанные документы (если необходимо)
4. Закоммитьте изменения

---

## Дополнительные ресурсы

- [PlantUML Documentation](https://plantuml.com/guide)
- [PlantUML Class Diagram](https://plantuml.com/class-diagram)
- [PlantUML Sequence Diagram](https://plantuml.com/sequence-diagram)
- [PlantUML Component Diagram](https://plantuml.com/component-diagram)

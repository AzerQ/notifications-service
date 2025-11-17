# UML Architecture Diagrams

This directory contains PlantUML diagrams that visualize the Notifications Service architecture.

## Diagrams

### 1. OVERALL_ARCHITECTURE.puml.md
**Overall System Architecture**

Shows the high-level application structure with four main layers:
- Presentation Layer (REST API, SignalR Hub)
- Application Layer (Services, Mappers, Data Resolvers)
- Domain Layer (Models, Interfaces, Validators)
- Infrastructure Layer (EF Core, Providers, Templates)

**Use for:** Understanding the overall project structure and interaction between layers.

---

### 2. DOMAIN_LAYER.puml.md
**Domain Layer - Business Logic Core**

Detailed diagram of the domain layer, including:
- **Models:** Notification, User, NotificationTemplate, NotificationMetadataField, NotificationChannelDeliveryStatus, UserRoutePreference
- **Enums:** NotificationChannel, NotificationDeliveryStatus
- **Interfaces:** INotificationRepository, IUserRepository, ITemplateRepository, IEmailProvider, ISmsProvider, IPushNotificationProvider, INotificationRouteConfiguration

**Use for:** Understanding domain models and their relationships, as well as interfaces that must be implemented in other layers.

---

### 3. APPLICATION_LAYER.puml.md
**Application Layer - Business Scenario Orchestration**

Application layer diagram showing:
- **Services:** NotificationCommandService, NotificationQueryService, NotificationSender
- **Routing:** NotificationRoutesContext
- **Mappers:** NotificationMapper and INotificationMapper interface
- **Interfaces:** INotificationCommandService, INotificationQueryService, INotificationSender, INotificationDataResolver, ITemplateRenderer
- **DTOs:** NotificationRequest, NotificationResponseDto, UserDto, ChannelStatusDto

**Use for:** Understanding how services coordinate business scenario execution and how data is transformed between layers.

---

### 4. INFRASTRUCTURE_LAYER.puml.md
**Infrastructure Layer - Data Access and External Services**

Infrastructure layer diagram including:
- **Data Access:** NotificationDbContext, repositories (NotificationRepository, UserRepository, TemplateRepository, UserRoutePreferenceRepository)
- **Email Provider:** SmtpEmailProvider, SmtpClientFactory, SmtpClientWrapper, EmailProviderOptions
- **Template Rendering:** HandlebarsTemplateRenderer, FileSystemTemplateProvider, TemplateOptions
- **Database:** SQLite DB

**Use for:** Understanding how data access is implemented and how external services (SMTP, file system) are integrated.

---

### 5. API_LAYER.puml.md
**API Layer - Application Entry Point**

API layer diagram showing:
- **Controllers:** NotificationController, UsersController, UserRoutePreferencesController
- **SignalR:** NotificationHub
- **Middleware:** ErrorHandlingMiddleware
- **DI & Configuration:** NotificationServiceDiConfigurationExtensions, NotificationDocumentFilter
- **HTTP Models:** NotificationRequest, NotificationResponseDto, BroadcastRequest

**Use for:** Understanding REST API endpoints and SignalR integration.

---

### 6. DATA_FLOW.puml.md
**Data Flow During Notification Processing**

Sequence diagram showing the complete notification processing flow:

1. HTTP request arrives at controller
2. Controller passes request to CommandService
3. CommandService gets data resolver from NotificationRoutesContext
4. Resolver determines recipients and prepares data
5. Mapper creates Notification objects with rendered template
6. Notifications are saved to DB
7. NotificationSender sends via all active channels
8. Delivery statuses are updated in DB
9. Response is returned to client

**Use for:** Understanding the complete notification processing cycle from request to response.

---

## How to Use Diagrams

### Viewing in PlantUML Editor

1. Go to [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy the contents of the `.puml.md` file (inside the ```plantuml code block)
3. Paste into the editor
4. The diagram will be displayed automatically

### Integration in Documentation

Diagrams are already integrated into the main documents:
- [02-Architecture.md](../02-Architecture.md) — contains links to all diagrams
- [03-Components.md](../03-Components.md) — references layer diagrams

### Exporting Diagrams

You can export diagrams to various formats:
- PNG
- SVG
- PDF

Use PlantUML CLI or the online editor for exporting.

---

## Diagram Structure

All diagrams use:
- **Color scheme** to differentiate layers:
  - Presentation Layer: #E1F5FE (light blue)
  - Application Layer: #F3E5F5 (purple)
  - Domain Layer: #E8F5E9 (green)
  - Infrastructure Layer: #FFF3E0 (orange)
  - External Systems: #F1F8E9 (light green)

- **Standard elements:**
  - `class` — classes and interfaces
  - `interface` — interfaces (with `<<interface>>`)
  - `enum` — enumerations
  - `package` — logical component groups
  - `database` — external systems (DB, SMTP, etc.)

---

## Updating Diagrams

When changing the architecture:

1. Update the corresponding `.puml.md` file
2. Verify the diagram in PlantUML editor
3. Update related documents (if necessary)
4. Commit changes

---

## Additional Resources

- [PlantUML Documentation](https://plantuml.com/guide)
- [PlantUML Class Diagram](https://plantuml.com/class-diagram)
- [PlantUML Sequence Diagram](https://plantuml.com/sequence-diagram)
- [PlantUML Component Diagram](https://plantuml.com/component-diagram)

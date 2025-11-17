# System Overview and Goals

## System Purpose

**Notifications Service** is a universal, extensible REST API notification service with support for multiple delivery channels and real-time alerts via SignalR.

### Main Goals

1. **Universality** — can be used in any project without being tied to specific business logic
2. **Extensibility** — easy addition of new notification types and delivery channels
3. **Flexibility** — support for various data sources and providers
4. **Real-time** — instant notification delivery through SignalR
5. **Modularity** — clean architecture with separation of concerns

## Key Features

### Notification Handler System

The service supports a flexible notification type system through an extensible handler architecture:

Example handlers:

1. **UserRegistered** — welcome notifications for new users
2. **OrderCreated** — order confirmations
3. **TaskAssigned** — task assignment notifications
4. **Custom Handlers** — easily add new notification types

### Notification Structure

Each notification contains:
- Creation date
- Title/Subject
- Category/Route
- Brief description
- Delivery status by channel
- Metadata (parameters)
- Real-time delivery support via SignalR

### Delivery Channels

Supported channels:
- **Email** — delivery via SMTP
- **Push** — Push notifications (optional)
- **Database** — storage in SQLite database
- **Real-time** — SignalR for InApp notifications
- **REST API** — retrieve notifications via API

### Functional Capabilities

✅ Flexible addition of new notification types  
✅ Customizable email templates (Handlebars)  
✅ Real-time push notifications via SignalR  
✅ User data from various sources  
✅ Extensible architecture  
✅ Universal, reusable handlers  
✅ User preferences for notification routes  
✅ Support for multiple delivery channels  

## Technology Stack

### Backend

- **.NET 8** — modern development platform
- **ASP.NET Core Web API** — REST API framework
- **Entity Framework Core** — ORM for database access
- **SQLite** — lightweight embedded database
- **SignalR** — real-time communications
- **Handlebars.NET** — email templating engine
- **System.Net.Mail** — email delivery
- **xUnit** — testing framework

### Frontend

- **React 18** — modern UI library
- **TypeScript** — typed JavaScript
- **MobX** — state management
- **SignalR Client** — real-time connection
- **Tailwind CSS** — utility-first CSS framework

### Development Tools

- **Swagger/OpenAPI** — API documentation
- **Docker** — containerization (optional)
- **Git** — version control system

## Development Principles

### SOLID Principles

- **S** (Single Responsibility) — each component has a single responsibility
- **O** (Open/Closed) — open for extension, closed for modification
- **L** (Liskov Substitution) — substitutability of derived classes
- **I** (Interface Segregation) — interface segregation by functionality
- **D** (Dependency Inversion) — depend on abstractions, not implementations

### DRY and KISS

- **DRY** (Don't Repeat Yourself) — repetitive code extracted into common components
- **KISS** (Keep It Simple, Stupid) — simple and clear solutions
- Minimal dependencies

### Modularity

- Each component in a separate file/project
- Clear separation of concerns
- Easy to test and replace components

## Architectural Approach

The project follows **Clean Architecture** principles with layer separation:

1. **Domain** — domain models and business logic (core)
2. **Application** — use cases and orchestration
3. **Infrastructure** — implementation of providers and data access
4. **API** — entry point, controllers, and DI composition

Dependencies flow from outer layers to inner layers, which ensures:
- Business logic independence from implementation details
- Easy replacement of infrastructure components
- Simple testing

## Use Cases

The service can be used in various scenarios:

### Enterprise Systems
- Task and process notifications
- System event alerts
- Reminders and deadlines

### E-commerce
- Order confirmations
- Delivery status updates
- Promotional campaigns and newsletters

### Social Platforms
- New message notifications
- Mentions and reactions
- Events and activities

### IoT and Monitoring
- Device status alerts
- Critical event warnings
- Metric reports

## Solution Benefits

### For Developers
- 📦 Ready-to-use solution out of the box
- 🔧 Easy configuration and integration
- 📚 Comprehensive documentation
- ⚙️ Test coverage
- 🎨 Ready-made UI components

### For Business
- 💰 Time savings in development
- 🚀 Quick launch of new features
- 📈 Scalability
- 🔒 Security and reliability
- 🛠️ Support and updates

## Next Steps

1. Explore [System Architecture](./02-Architecture.md)
2. Review [Key Components](./03-Components.md)
3. Try the [API](./04-API.md) in action
4. Integrate [Frontend Components](./05-Frontend.md)
5. Read the [Developer Guide](./06-Development-Guide.md)

# Notifications Service Documentation

Welcome to the documentation of the universal notification service!

## 🚀 New: Showcase Application

A fully-featured demonstration application with authentication and targeted notifications has been created!

**Key Features:**
- ✅ JWT authentication
- ✅ Targeted notification delivery via SignalR (only to specific users)
- ✅ React + TypeScript + MobX + Tailwind CSS
- ✅ Beautiful UI with gradients and responsive design
- ✅ State management with MobX
- ✅ Real-time updates

**Quick Start:**
```bash
# If showcase directory exists
cd showcase
./start.sh    # Linux/Mac
start.bat     # Windows
```

For more details, check if `showcase/` directory exists in your repository.

## 📚 Table of Contents

1. [**Overview and Goals**](./01-Overview.md)
   - System purpose
   - Key features
   - Technology stack

2. [**System Architecture**](./02-Architecture.md)
   - Overall architecture
   - Multi-layered structure
   - Component interaction
   - Diagrams (UML architecture)

3. [**Key Components**](./03-Components.md)
   - Domain layer
   - Application layer
   - Infrastructure layer
   - API layer
   - Frontend components

4. [**API Reference**](./04-API.md)
   - REST API endpoints
   - JWT Authentication
   - SignalR Hub with targeted delivery
   - Request and response examples
   - Data models

5. [**Frontend Components**](./05-Frontend.md)
   - Frontend architecture
   - React components
   - Notification system
   - SignalR integration
   - UI components

6. [**Developer Guide**](./06-Development-Guide.md)
   - How to add a new notification type
   - How to add a new delivery channel
   - Working with templates
   - Database migrations
   - Testing

7. [**Integration Guide**](./07-Integration-Guide.md)
   - Embedding frontend components
   - Configuring backend API
   - JWT authentication
   - Targeted notifications via SignalR
   - Configuration
   - Deployment

8. [**Showcase Application**](./08-Showcase-Application.md)
   - Overview and features
   - Technology stack
   - Setup and running
   - User guide
   - Architecture details

## 🚀 Quick Start

### Backend API

```bash
cd backend
dotnet build
dotnet run --project src/NotificationService.Api
```

API available at: http://localhost:5093

### Frontend Component

```bash
cd frontend/sed-notifications-frontend
npm install
npm start
```

Frontend available at: http://localhost:3000

### Test Application

```bash
cd testapp
./start.sh    # Linux/Mac
start.bat     # Windows
```

Open http://localhost:8080 in your browser.

## 📖 Additional Resources

### Architecture Diagrams
- [UML Diagrams](./diagrams/README.md) — PlantUML diagrams of all architecture layers
  - [Overall Architecture](./diagrams/OVERALL_ARCHITECTURE.puml.md)
  - [Domain Layer](./diagrams/DOMAIN_LAYER.puml.md)
  - [Application Layer](./diagrams/APPLICATION_LAYER.puml.md)
  - [Infrastructure Layer](./diagrams/INFRASTRUCTURE_LAYER.puml.md)
  - [API Layer](./diagrams/API_LAYER.puml.md)
  - [Data Flow](./diagrams/DATA_FLOW.puml.md)

### Examples
- [API Usage Examples](./04-API.md#examples)
- [Notification Handler Examples](../../backend/src/NotificationService.TestHandlers/Notifications/)

## 🌍 Available Languages

This documentation is available in the following languages:
- **English** (current) - [/docs/en/](../en/)
- **Русский** (Russian) - [/docs/ru/](../ru/)

## 🔧 Support

If you have questions or issues:
1. Check the documentation in the sections above
2. Review examples in the repository
3. Create an issue on GitHub

## 📄 License

See the [LICENSE](../../LICENSE) file for license information.

# Ключевые компоненты системы

Этот документ содержит подробное описание всех ключевых компонентов сервиса уведомлений.

## Доменный слой (Domain Layer)

### Notification

Центральная доменная модель, представляющая уведомление.

**Файл:** `backend/src/NotificationService.Domain/Models/Notification.cs`

```csharp
public record Notification
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public required string Route { get; set; }
    public DateTime CreatedAt { get; set; }
    public User Recipient { get; set; }
    public NotificationTemplate? Template { get; set; }
    public ICollection<NotificationMetadataField> Metadata { get; set; }
    public ICollection<NotificationChannelDeliveryStatus> DeliveryChannelsState { get; set; }
}
```

**Свойства:**
- `Id` — уникальный идентификатор уведомления
- `Title` — заголовок уведомления
- `Message` — основное содержимое/текст уведомления
- `Route` — тип/маршрут уведомления (например, "UserRegistered")
- `CreatedAt` — дата и время создания
- `Recipient` — получатель уведомления
- `Template` — связанный шаблон для форматирования
- `Metadata` — дополнительные метаданные в формате ключ-значение
- `DeliveryChannelsState` — статусы доставки по каналам

### NotificationChannelDeliveryStatus

Статус доставки уведомления по конкретному каналу.

```csharp
public record NotificationChannelDeliveryStatus
{
    public NotificationChannel NotificationChannel { get; init; }
    public NotificationDeliveryStatus DeliveryStatus { get; set; }
    public Guid NotificationId { get; set; }
    public Notification Notification { get; set; }
    public Guid Id { get; init; }
}
```

**Свойства:**
- `NotificationChannel` — канал доставки (Email, SMS, Push)
- `DeliveryStatus` — статус доставки (Pending, Sent, Failed, Skipped)

### NotificationMetadataField

Метаданные уведомления в формате ключ-значение-описание.

```csharp
public record NotificationMetadataField
{
    public Guid Id { get; set; }
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Description { get; set; }
    public Guid NotificationId { get; set; }
    public Notification Notification { get; set; }
}
```

### User

Модель пользователя-получателя уведомлений.

**Файл:** `backend/src/NotificationService.Domain/Models/User.cs`

```csharp
public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? DeviceToken { get; set; }
}
```

**Свойства:**
- `Id` — уникальный идентификатор пользователя
- `Username` — имя пользователя
- `Email` — email адрес для доставки
- `PhoneNumber` — номер телефона для SMS (опционально)
- `DeviceToken` — токен устройства для Push (опционально)

### NotificationTemplate

Шаблон для форматирования уведомлений.

```csharp
public class NotificationTemplate
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Subject { get; set; }
    public required string Content { get; set; }
}
```

**Свойства:**
- `Name` — уникальное имя шаблона
- `Subject` — тема/заголовок
- `Content` — содержимое (Handlebars шаблон)

### UserRoutePreference

Предпочтения пользователя по маршрутам уведомлений.

```csharp
public class UserRoutePreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    public required string Route { get; set; }
    public bool IsEnabled { get; set; }
}
```

### Перечисления (Enums)

**Файл:** `backend/src/NotificationService.Domain/Models/Enums.cs`

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

### NotificationValidator

Валидатор для проверки корректности уведомлений перед отправкой.

**Файл:** `backend/src/NotificationService.Domain/Models/NotificationValidator.cs`

```csharp
public static class NotificationValidator
{
    public static ValidationResult Validate(Notification notification)
    {
        var errors = new List<string>();
        
        if (string.IsNullOrWhiteSpace(notification.Title))
            errors.Add("Title is required");
            
        if (notification.Recipient == null)
            errors.Add("Recipient is required");
            
        // ... дополнительные проверки
        
        return new ValidationResult(errors);
    }
}
```

### Интерфейсы репозиториев

#### INotificationRepository

```csharp
public interface INotificationRepository
{
    Task<Notification?> GetNotificationByIdAsync(Guid id);
    Task<IReadOnlyCollection<Notification>> GetNotificationsForUserAsync(Guid userId);
    Task<IReadOnlyCollection<Notification>> GetNotificationsByStatusAsync(
        NotificationDeliveryStatus status);
    Task SaveNotificationsAsync(params Notification[] notifications);
    Task UpdateNotificationsAsync(params Notification[] notifications);
}
```

#### IUserRepository

```csharp
public interface IUserRepository
{
    Task<User?> GetUserByIdAsync(Guid id);
    Task<IReadOnlyCollection<User>> GetAllUsersAsync();
    Task SaveUsersAsync(params User[] users);
}
```

#### ITemplateRepository

```csharp
public interface ITemplateRepository
{
    Task<NotificationTemplate?> GetTemplateByNameAsync(string name);
    Task<IReadOnlyCollection<NotificationTemplate>> GetAllTemplatesAsync();
}
```

### Интерфейсы провайдеров

#### IEmailProvider

```csharp
public interface IEmailProvider
{
    Task<bool> SendEmailAsync(string to, string subject, string body);
}
```

#### ISmsProvider

```csharp
public interface ISmsProvider
{
    Task<bool> SendSmsAsync(string phoneNumber, string message);
}
```

#### IPushNotificationProvider

```csharp
public interface IPushNotificationProvider
{
    Task<bool> SendPushNotificationAsync(string deviceToken, string title, string body);
}
```

## Прикладной слой (Application Layer)

### NotificationCommandService

Сервис для выполнения команд (создание и отправка уведомлений).

**Файл:** `backend/src/NotificationService.Application/Services/NotificationService.cs`

```csharp
public class NotificationCommandService : INotificationCommandService
{
    public async Task<NotificationResponseDto> ProcessNotificationRequestAsync(
        NotificationRequest request)
    {
        // 1. Получить резолвер данных для маршрута
        var dataResolver = notificationRoutesContext.GetDataResolverForRoute(request.Route);
        
        // 2. Получить конфигурацию маршрута
        var routeConfig = notificationRoutesContext.GetNotificationRouteConfiguration(request.Route);
        
        // 3. Получить шаблон
        var template = await templateRepository.GetTemplateByNameAsync(routeConfig.TemplateName);
        
        // 4. Маппинг и создание уведомлений
        var notifications = await notificationMapper.MapFromRequest(request, dataResolver, template);
        
        // 5. Сохранение в БД
        await notificationRepository.SaveNotificationsAsync(notifications);
        
        // 6. Отправка по каналам
        await Task.WhenAll(notifications.Select(notificationSender.SendAsync));
        
        // 7. Возврат ответа
        return notificationMapper.MapToResponse(notifications);
    }
}
```

**Основные методы:**
- `ProcessNotificationRequestAsync` — создание и отправка уведомления

### NotificationQueryService

Сервис для выполнения запросов (чтение уведомлений).

```csharp
public class NotificationQueryService : INotificationQueryService
{
    public async Task<NotificationResponseDto?> GetByIdAsync(Guid id);
    public async Task<IReadOnlyCollection<NotificationResponseDto>> GetByUserAsync(Guid userId);
    public async Task<IReadOnlyCollection<NotificationResponseDto>> GetByStatusAsync(string status);
}
```

### NotificationSender

Сервис оркестрации отправки уведомлений по различным каналам.

**Файл:** `backend/src/NotificationService.Application/Services/NotificationSender.cs`

```csharp
public class NotificationSender : INotificationSender
{
    public async Task SendAsync(Notification notification)
    {
        // 1. Валидация уведомления
        var validationResult = NotificationValidator.Validate(notification);
        if (!validationResult.IsValid)
            throw new ArgumentException(string.Join("; ", validationResult.Errors));
        
        // 2. Проверка пользовательских предпочтений
        var allowed = await userRoutePreferenceRepository
            .IsRouteEnabledAsync(notification.Recipient.Id, notification.Route);
        
        if (!allowed)
        {
            // Пропустить отправку
            MarkAsSkipped(notification);
            return;
        }
        
        // 3. Отправка по всем активным каналам
        await Task.WhenAll(notification.DeliveryChannelsState
            .Select(channel => SendToChannelAsync(notification, channel.NotificationChannel)));
        
        // 4. Обновление статусов в БД
        await notificationRepository.UpdateNotificationsAsync(notification);
    }
    
    private async Task SendToChannelAsync(Notification notification, NotificationChannel channel)
    {
        var wasSent = channel switch
        {
            NotificationChannel.Email => await SendEmailAsync(notification),
            NotificationChannel.Sms => await SendSmsAsync(notification),
            NotificationChannel.Push => await SendPushAsync(notification),
            _ => throw new NotSupportedException($"Channel {channel} not supported")
        };
        
        UpdateChannelStatus(notification, channel, 
            wasSent ? NotificationDeliveryStatus.Sent : NotificationDeliveryStatus.Failed);
    }
}
```

**Ключевые особенности:**
- Валидация перед отправкой
- Проверка пользовательских предпочтений
- Параллельная отправка по каналам
- Обработка ошибок и обновление статусов

### NotificationRoutesContext

Реестр маршрутов уведомлений и их обработчиков.

**Файл:** `backend/src/NotificationService.Application/NotificationRoutesContext.cs`

```csharp
public class NotificationRoutesContext
{
    private readonly Dictionary<string, INotificationDataResolver> _dataResolvers;
    private readonly Dictionary<string, INotificationRouteConfiguration> _routeConfigurations;
    
    public void RegisterRoute(string route, 
        INotificationDataResolver dataResolver,
        INotificationRouteConfiguration routeConfig)
    {
        _dataResolvers[route] = dataResolver;
        _routeConfigurations[route] = routeConfig;
    }
    
    public INotificationDataResolver GetDataResolverForRoute(string route)
    {
        if (!_dataResolvers.TryGetValue(route, out var resolver))
            throw new ArgumentException($"Route '{route}' not registered");
        return resolver;
    }
    
    public INotificationRouteConfiguration GetNotificationRouteConfiguration(string route)
    {
        if (!_routeConfigurations.TryGetValue(route, out var config))
            throw new ArgumentException($"Route '{route}' not registered");
        return config;
    }
}
```

### INotificationDataResolver

Интерфейс для резолверов данных уведомлений.

```csharp
public interface INotificationDataResolver
{
    Task<IReadOnlyCollection<User>> ResolveRecipientsAsync(
        Dictionary<string, object> parameters);
    
    Task<Dictionary<string, object>> ResolveTemplateDataAsync(
        User recipient, 
        Dictionary<string, object> parameters);
}
```

**Ответственность:**
- Получение списка получателей на основе параметров запроса
- Подготовка данных для рендеринга шаблона

### NotificationMapper

Мапперы для преобразования между доменными моделями и DTO.

**Файл:** `backend/src/NotificationService.Application/Mappers/NotificationMapper.cs`

```csharp
public class NotificationMapper : INotificationMapper
{
    public async Task<IReadOnlyCollection<Notification>> MapFromRequest(
        NotificationRequest request,
        INotificationDataResolver dataResolver,
        NotificationTemplate template)
    {
        // Получить получателей
        var recipients = await dataResolver.ResolveRecipientsAsync(request.Parameters);
        
        var notifications = new List<Notification>();
        
        foreach (var recipient in recipients)
        {
            // Получить данные для шаблона
            var templateData = await dataResolver.ResolveTemplateDataAsync(
                recipient, request.Parameters);
            
            // Рендеринг шаблона
            var renderedContent = await templateRenderer.RenderAsync(
                template.Content, templateData);
            
            // Создание уведомления
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = template.Subject,
                Message = renderedContent,
                Route = request.Route,
                Recipient = recipient,
                Template = template,
                Metadata = CreateMetadata(templateData),
                DeliveryChannelsState = DetermineChannels(request.Channel)
            };
            
            notifications.Add(notification);
        }
        
        return notifications;
    }
    
    public NotificationResponseDto MapToResponse(IReadOnlyCollection<Notification> notifications)
    {
        // Преобразование в DTO для API ответа
    }
}
```

### DTO (Data Transfer Objects)

#### NotificationRequest

Входящий запрос на создание уведомления.

```csharp
public record NotificationRequest
{
    public required string Route { get; init; }
    public string? Channel { get; init; }
    public required Dictionary<string, object> Parameters { get; init; }
}
```

#### NotificationResponseDto

Ответ API с информацией об уведомлении.

```csharp
public record NotificationResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; }
    public string Message { get; init; }
    public string Route { get; init; }
    public DateTime CreatedAt { get; init; }
    public UserDto Recipient { get; init; }
    public List<ChannelStatusDto> ChannelStatuses { get; init; }
}
```

## Инфраструктурный слой (Infrastructure Layer)

### NotificationDbContext

EF Core контекст базы данных.

**Файл:** `backend/src/NotificationService.Infrastructure/Data/NotificationDbContext.cs`

```csharp
public class NotificationDbContext : DbContext
{
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
    public DbSet<NotificationMetadataField> NotificationMetadataFields { get; set; }
    public DbSet<NotificationChannelDeliveryStatus> NotificationChannelDeliveryStatuses { get; set; }
    public DbSet<UserRoutePreference> UserRoutePreferences { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Fluent API конфигурации
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NotificationDbContext).Assembly);
    }
}
```

### SmtpEmailProvider

Реализация отправки email через SMTP.

**Файл:** `backend/src/NotificationService.Infrastructure/Providers/Email/SmtpEmailProvider.cs`

```csharp
public class SmtpEmailProvider : IEmailProvider
{
    private readonly ISmtpClientFactory _smtpClientFactory;
    private readonly EmailProviderOptions _options;
    
    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            using var smtpClient = _smtpClientFactory.CreateClient();
            
            var message = new MailMessage
            {
                From = new MailAddress(_options.FromAddress, _options.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(to);
            
            await smtpClient.SendMailAsync(message);
            return true;
        }
        catch (Exception ex)
        {
            // Логирование ошибки
            return false;
        }
    }
}
```

### HandlebarsTemplateRenderer

Рендеринг шаблонов с использованием Handlebars.

**Файл:** `backend/src/NotificationService.Infrastructure/Templates/HandlebarsTemplateRenderer.cs`

```csharp
public class HandlebarsTemplateRenderer : ITemplateRenderer
{
    public Task<string> RenderAsync(string template, Dictionary<string, object> data)
    {
        var compiledTemplate = Handlebars.Compile(template);
        var result = compiledTemplate(data);
        return Task.FromResult(result);
    }
}
```

## API слой (API Layer)

### NotificationController

Контроллер REST API для работы с уведомлениями.

**Файл:** `backend/src/NotificationService.Api/Controllers/NotificationController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SendNotification([FromBody] NotificationRequest request)
    {
        var response = await _commandService.ProcessNotificationRequestAsync(request);
        return Ok(response);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetNotification(Guid id)
    {
        var notification = await _queryService.GetByIdAsync(id);
        return notification is null ? NotFound() : Ok(notification);
    }
    
    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> GetNotificationsByUser(Guid userId)
    {
        var notifications = await _queryService.GetByUserAsync(userId);
        return Ok(notifications);
    }
}
```

### NotificationHub

SignalR Hub для real-time уведомлений.

**Файл:** `backend/src/NotificationService.Api/Hubs/NotificationHub.cs`

```csharp
public class NotificationHub : Hub
{
    public async Task BroadcastNotification(object notification)
    {
        await Clients.All.SendAsync("ReceiveNotification", notification);
    }
    
    public async Task SendToUser(string userId, object notification)
    {
        await Clients.User(userId).SendAsync("ReceiveNotification", notification);
    }
}
```

## Обработчики уведомлений (Test Handlers)

### Структура обработчика

Каждый обработчик состоит из:

1. **Data Resolver** — получение данных для уведомления
2. **Route Configuration** — конфигурация маршрута
3. **HTML Template** (`.hbs`) — Handlebars шаблон
4. **Template Config** (`template.json`) — метаданные шаблона

### Пример: UserRegisteredDataResolver

**Файл:** `backend/src/NotificationService.TestHandlers/Notifications/UserRegistered/UserRegisteredDataResolver.cs`

```csharp
public class UserRegisteredDataResolver : INotificationDataResolver
{
    private readonly IUserRepository _userRepository;
    
    public async Task<IReadOnlyCollection<User>> ResolveRecipientsAsync(
        Dictionary<string, object> parameters)
    {
        if (!parameters.TryGetValue("UserId", out var userIdObj))
            throw new ArgumentException("UserId parameter is required");
        
        var userId = Guid.Parse(userIdObj.ToString());
        var user = await _userRepository.GetUserByIdAsync(userId);
        
        return user is null ? Array.Empty<User>() : new[] { user };
    }
    
    public Task<Dictionary<string, object>> ResolveTemplateDataAsync(
        User recipient, 
        Dictionary<string, object> parameters)
    {
        var data = new Dictionary<string, object>
        {
            ["UserName"] = recipient.Username,
            ["Email"] = recipient.Email,
            ["RegistrationDate"] = DateTime.Now,
            ["WelcomeMessage"] = parameters.GetValueOrDefault("WelcomeMessage", 
                "Welcome to our service!")
        };
        
        return Task.FromResult(data);
    }
}
```

## Следующие шаги

1. Изучите [API документацию](./04-API.md) для работы с сервисом
2. Ознакомьтесь с [Frontend компонентами](./05-Frontend.md)
3. Прочитайте [Руководство разработчика](./06-Development-Guide.md) для добавления новых обработчиков

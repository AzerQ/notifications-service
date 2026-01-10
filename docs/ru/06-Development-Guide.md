# Руководство разработчика

Подробное руководство по разработке и расширению сервиса уведомлений.

## Содержание

1. [Добавление нового типа уведомления](#добавление-нового-типа-уведомления)
2. [Добавление нового канала доставки](#добавление-нового-канала-доставки)
3. [Работа с шаблонами](#работа-с-шаблонами)
4. [Миграции базы данных](#миграции-базы-данных)
5. [Тестирование](#тестирование)
6. [Лучшие практики](#лучшие-практики)

---

## Добавление нового типа уведомления

### Обзор процесса

Для добавления нового типа уведомления необходимо:

1. Создать класс обработчика маршрута, реализующий `INotificationRoute`
2. Создать HTML шаблон (`.hbs`)
3. Создать конфигурацию шаблона (`template.json`)
4. Зарегистрировать обработчик

### Шаг 1: Создание структуры файлов

Создайте новую папку в `backend/src/NotificationService.TestHandlers/Notifications/`:

```
MyNotification/
├── MyNotificationNotificationRoute.cs  # Обработчик маршрута
├── MyNotification.hbs                  # HTML шаблон
└── template.json                       # Метаданные шаблона
```

### Шаг 2: Реализация Notification Route

**Файл:** `MyNotificationNotificationRoute.cs`

```csharp
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.MyNotification;

[NotificationRoute(Name = Route)]
public class MyNotificationNotificationRoute(IUserRepository userRepository) : INotificationRoute
{
    public const string Route = "MyNotification";

    public NotificationRouteConfiguration RouteConfiguration { get; } = new()
    {
        Name = Route,
        NotificationObjectKind = new("MyObject", "Мой объект"),
        TemplateName = Route,
        DisplayName = "Мое уведомление",
        Description = "Описание уведомления",
        Tags = ["тег1", "тег2"],
        PayloadType = typeof(MyNotificationRequestData),
        Icon = new("bell")
    };

    public Task<IEnumerable<Guid>> ResolveNotificationRecipientsIds(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<MyNotificationRequestData>();
        return Task.FromResult<IEnumerable<Guid>>(parameters?.UserId != null ? [parameters.UserId] : []);
    }

    public async Task<NotificationFullData> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<MyNotificationRequestData>();
        var user = await userRepository.GetUserByIdAsync(parameters.UserId);
        
        return new NotificationFullData(new MyNotificationTemplateModel
        {
            UserName = user?.Name ?? "User",
            CustomField = parameters.CustomField
        }, "https://example.com/objects/1");
    }
}

public class MyNotificationRequestData { public Guid UserId { get; set; } public string CustomField { get; set; } }
public class MyNotificationTemplateModel { public string UserName { get; set; } public string CustomField { get; set; } }
```

### Шаг 4: Создание HTML шаблона

**Файл:** `MyNotification.hbs`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>My Notification</h1>
    </div>
    
    <div class="content">
        <h2>Hello, {{UserName}}!</h2>
        
        <p>{{CustomField}}</p>
        
        <p>Date: {{FormattedDate}}</p>
        
        {{#if Email}}
        <p>Your email: {{Email}}</p>
        {{/if}}
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply.</p>
    </div>
</body>
</html>
```

**Handlebars helpers:**

Доступные помощники:
- `{{#if condition}}...{{/if}}` — условный вывод
- `{{#each array}}...{{/each}}` — итерация по массиву
- `{{formatDate date "dd.MM.yyyy"}}` — форматирование даты (если зарегистрирован)
- `{{uppercase text}}` — преобразование в верхний регистр (если зарегистрирован)

### Шаг 5: Конфигурация шаблона

**Файл:** `template.json`

```json
{
  "name": "MyNotificationTemplate",
  "subject": "My Notification for {{UserName}}",
  "description": "Template for my custom notification",
  "version": "1.0.0",
  "author": "Your Name",
  "channelsTemplates": [
    { "channel": "Email", "filePath": "MyNotification.hbs" }
  ]
}
```

### Шаг 6: Регистрация обработчика

Обработчик автоматически регистрируется при запуске приложения, если:

1. Реализует интерфейс `INotificationRoute` и помечен атрибутом `[NotificationRoute]`
2. Находится в сборке, переданной в `AddNotificationsServiceModules`

**Проверка в** `Program.cs`:

```csharp
builder.Services.AddNotificationsServiceModules(
    builder.Configuration,
    typeof(NotificationService.TestHandlers.NotificationsModuleServicesRegister).Assembly
);
```

### Шаг 7: Тестирование

Создайте запрос к API:

```bash
curl -X POST http://localhost:5093/api/notification/MyNotification \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "UserId": "00000000-0000-0000-0000-000000000001",
      "CustomField": "Custom value here"
    }
  }'
```

---

## Добавление нового канала доставки

### Обзор процесса

Для добавления нового канала доставки (например, Telegram, Slack, SMS):

1. Добавить enum значение
2. Создать интерфейс провайдера
3. Реализовать провайдер
4. Зарегистрировать в DI
5. Расширить NotificationSender
6. Обновить валидатор

### Шаг 1: Добавление enum значения

**Файл:** `backend/src/NotificationService.Domain/Models/Enums.cs`

```csharp
public enum NotificationChannel
{
    Email,
    InApp,
    Telegram,  // Новый канал
    Slack      // Новый канал
}
```

### Шаг 2: Создание интерфейса провайдера

**Файл:** `backend/src/NotificationService.Domain/Interfaces/INotificationProviders.cs`

```csharp
/// <summary>
/// Интерфейс для отправки уведомлений через Telegram.
/// </summary>
public interface ITelegramProvider
{
    /// <summary>
    /// Отправляет уведомление в Telegram.
    /// </summary>
    /// <param name="chatId">ID чата Telegram</param>
    /// <param name="message">Текст сообщения</param>
    /// <returns>True если отправка успешна, иначе false</returns>
    Task<bool> SendTelegramMessageAsync(string chatId, string message);
}
```

### Шаг 3: Реализация провайдера

**Файл:** `backend/src/NotificationService.Infrastructure/Providers/Telegram/TelegramProvider.cs`

```csharp
using NotificationService.Domain.Interfaces;
using Telegram.Bot;
using Telegram.Bot.Types;

namespace NotificationService.Infrastructure.Providers.Telegram;

/// <summary>
/// Провайдер для отправки уведомлений через Telegram Bot API.
/// </summary>
public class TelegramProvider : ITelegramProvider
{
    private readonly TelegramBotClient _botClient;
    private readonly ILogger<TelegramProvider> _logger;

    public TelegramProvider(
        TelegramProviderOptions options,
        ILogger<TelegramProvider> logger)
    {
        _botClient = new TelegramBotClient(options.BotToken);
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Отправляет уведомление в Telegram.
    /// </summary>
    public async Task<bool> SendTelegramMessageAsync(string chatId, string message)
    {
        try
        {
            await _botClient.SendTextMessageAsync(
                chatId: chatId,
                text: message,
                parseMode: Telegram.Bot.Types.Enums.ParseMode.Html
            );

            _logger.LogInformation("Telegram message sent to chat {ChatId}", chatId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram message to chat {ChatId}", chatId);
            return false;
        }
    }
}

/// <summary>
/// Опции конфигурации для Telegram провайдера.
/// </summary>
public class TelegramProviderOptions
{
    public string BotToken { get; set; } = string.Empty;
}
```

### Шаг 4: Регистрация в DI

**Файл:** `backend/src/NotificationService.Api/Program.cs` или DI Extension

```csharp
// Регистрация Telegram провайдера
builder.Services.Configure<TelegramProviderOptions>(
    builder.Configuration.GetSection("Telegram")
);

builder.Services.AddSingleton<ITelegramProvider, TelegramProvider>();
```

**Конфигурация в** `appsettings.json`:

```json
{
  "Telegram": {
    "BotToken": "your-telegram-bot-token"
  }
}
```

### Шаг 5: Расширение NotificationSender

**Файл:** `backend/src/NotificationService.Application/Services/NotificationSender.cs`

```csharp
public class NotificationSender : INotificationSender
{
    private readonly ITelegramProvider? _telegramProvider;

    public NotificationSender(
        // ...
        ITelegramProvider? telegramProvider = null,  // Добавлен новый провайдер
        // ...
    )
    {
        // ...
        _telegramProvider = telegramProvider;  // Сохранение провайдера
    }

    private async Task SendToChannelAsync(Notification notification, NotificationChannel channel, string content, NotificationRouteConfiguration routeConfiguration)
    {
        var wasSent = channel switch
        {
            NotificationChannel.Email => await SendEmailAsync(notification, content),
            NotificationChannel.InApp => await SendInAppAsync(notification, content, routeConfiguration),
            NotificationChannel.Telegram => await SendTelegramAsync(notification, content),  // Новый канал
            _ => throw new NotSupportedException($"Channel {channel} not supported")
        };

        notification.DeliveryChannelsState
            .FirstOrDefault(c => c.NotificationChannel == channel)!
            .DeliveryStatus = wasSent ? NotificationDeliveryStatus.Sent : NotificationDeliveryStatus.Failed;
    }

    /// <summary>
    /// Отправляет уведомление через Telegram.
    /// </summary>
    private async Task<bool> SendTelegramAsync(Notification notification, string content)
    {
        if (_telegramProvider is null)
        {
            return false;
        }

        // Предполагается, что Telegram Chat ID хранится в User.DeviceToken
        if (string.IsNullOrWhiteSpace(notification.Recipient.DeviceToken))
        {
            return false;
        }

        return await _telegramProvider.SendTelegramMessageAsync(
            notification.Recipient.DeviceToken,
            content
        );
    }
}
```

### Шаг 6: Обновление валидатора

Если новый канал требует специфических полей в User:

**Файл:** `backend/src/NotificationService.Domain/Models/NotificationValidator.cs`

```csharp
public static class NotificationValidator
{
    public static ValidationResult Validate(Notification notification)
    {
        var errors = new List<string>();

        // ... существующие проверки ...

        // Проверка для Telegram канала
        if (notification.DeliveryChannelsState
            .Any(c => c.NotificationChannel == NotificationChannel.Telegram))
        {
            if (string.IsNullOrWhiteSpace(notification.Recipient.DeviceToken))
            {
                errors.Add("Telegram Chat ID is required for Telegram channel");
            }
        }

        return new ValidationResult(errors);
    }
}
```

---

## Работа с шаблонами

### Структура шаблона

Шаблоны используют Handlebars.NET для рендеринга.

### Регистрация кастомных helpers

**Файл:** `backend/src/NotificationService.Infrastructure/Templates/HandlebarsTemplateRenderer.cs`

```csharp
public class HandlebarsTemplateRenderer : ITemplateRenderer
{
    public HandlebarsTemplateRenderer()
    {
        RegisterHelpers();
    }

    private void RegisterHelpers()
    {
        // Helper для форматирования даты
        Handlebars.RegisterHelper("formatDate", (writer, context, parameters) =>
        {
            if (parameters.Length < 2) return;
            
            var date = (DateTime)parameters[0];
            var format = parameters[1].ToString();
            
            writer.WriteSafeString(date.ToString(format));
        });

        // Helper для преобразования в верхний регистр
        Handlebars.RegisterHelper("uppercase", (writer, context, parameters) =>
        {
            if (parameters.Length < 1) return;
            
            var text = parameters[0]?.ToString() ?? string.Empty;
            writer.WriteSafeString(text.ToUpper());
        });

        // Helper для условного отображения
        Handlebars.RegisterHelper("ifEquals", (writer, options, context, parameters) =>
        {
            if (parameters.Length < 2) return;
            
            if (parameters[0]?.ToString() == parameters[1]?.ToString())
            {
                options.Template(writer, context);
            }
            else
            {
                options.Inverse(writer, context);
            }
        });
    }

    public Task<string> RenderAsync(string template, Dictionary<string, object> data)
    {
        var compiledTemplate = Handlebars.Compile(template);
        var result = compiledTemplate(data);
        return Task.FromResult(result);
    }
}
```

### Использование в шаблоне

```html
<!-- Форматирование даты -->
<p>Date: {{formatDate Date "dd.MM.yyyy HH:mm"}}</p>

<!-- Преобразование в верхний регистр -->
<h2>{{uppercase Title}}</h2>

<!-- Условное отображение -->
{{#ifEquals Status "Completed"}}
  <p style="color: green;">Task completed!</p>
{{else}}
  <p style="color: orange;">Task in progress...</p>
{{/ifEquals}}
```

---

## Миграции базы данных

### Создание миграции

```bash
cd backend/src/NotificationService.Infrastructure

# Создать новую миграцию
dotnet ef migrations add MigrationName --startup-project ../NotificationService.Api

# Применить миграции
dotnet ef database update --startup-project ../NotificationService.Api
```

### Пример миграции

Если вы добавили новое поле в модель User:

```csharp
public class User
{
    // ... existing fields ...
    public string? TelegramChatId { get; set; }  // Новое поле
}
```

Создайте миграцию:

```bash
dotnet ef migrations add AddTelegramChatIdToUser --startup-project ../NotificationService.Api
```

---

## Тестирование

### Unit тесты

**Файл:** `tests/NotificationService.Application.Tests/NotificationSenderTests.cs`

```csharp
using Xunit;
using Moq;
using NotificationService.Application.Services;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

public class NotificationSenderTests
{
    [Fact]
    public async Task SendAsync_WithValidNotification_SendsEmail()
    {
        // Arrange
        var mockRepository = new Mock<INotificationRepository>();
        var mockEmailProvider = new Mock<IEmailProvider>();
        
        mockEmailProvider
            .Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(true);

        var sender = new NotificationSender(
            mockTemplateRepo.Object,
            mockRepository.Object,
            mockRenderer.Object,
            mockEmailProvider.Object,
            mockPrefsRepo.Object,
            mockInAppSender.Object,
            inAppMapper
        );

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            Title = "Test",
            Message = "Test message",
            Route = "Test",
            Recipient = new User
            {
                Id = Guid.NewGuid(),
                Username = "test",
                Email = "test@example.com"
            },
            DeliveryChannelsState = new List<NotificationChannelDeliveryStatus>
            {
                new() { NotificationChannel = NotificationChannel.Email }
            }
        };

        // Act
        await sender.SendAsync(notification);

        // Assert
        mockEmailProvider.Verify(
            x => x.SendEmailAsync("test@example.com", It.IsAny<string>(), It.IsAny<string>()),
            Times.Once
        );
    }
}
```

---

## Лучшие практики

### 1. Именование

- **Маршруты:** PascalCase (например, `UserRegistered`)
- **Шаблоны:** Суффикс `Template` (например, `UserRegisteredTemplate`)
- **Классы:** Префикс типа уведомления (например, `UserRegisteredDataResolver`)

### 2. Обработка ошибок

- Всегда логируйте ошибки
- Возвращайте `false` вместо выброса исключений в провайдерах
- Используйте `try-catch` для внешних вызовов

### 3. Валидация

- Валидируйте параметры на входе в Data Resolver
- Проверяйте наличие обязательных полей
- Используйте понятные сообщения об ошибках

### 4. Производительность

- Используйте `async/await` для I/O операций
- Кешируйте скомпилированные шаблоны
- Используйте `Task.WhenAll` для параллельной отправки

### 5. Безопасность

- Не логируйте чувствительные данные
- Используйте переменные окружения для секретов
- Валидируйте все входные данные

### 6. Тестирование

- Пишите unit тесты для всех резолверов
- Используйте моки для внешних зависимостей
- Покрывайте граничные случаи

---

## Чек-лист PR

Перед созданием Pull Request убедитесь, что:

- [ ] Добавлен новый обработчик с полной реализацией
- [ ] Созданы и применены миграции БД (если нужно)
- [ ] Написаны unit тесты
- [ ] Обновлена документация API (примеры)
- [ ] Проверена сборка (`dotnet build`)
- [ ] Запущены тесты (`dotnet test`)
- [ ] Обновлен README (если добавлен новый канал)
- [ ] Добавлены комментарии к публичным методам
- [ ] Проверен код на соответствие стилю проекта

---

## Следующие шаги

1. Изучите [Руководство по интеграции](./07-Integration-Guide.md) для развертывания
2. Ознакомьтесь с существующими обработчиками в `backend/src/NotificationService.TestHandlers/`
3. Попробуйте создать свой обработчик уведомлений

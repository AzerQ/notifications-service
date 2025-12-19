using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.TestHandlers.Notifications.UserRegistered;

[NotificationRoute(Name = Route)]
public class UserRegisteredDataResolver(IUserRepository userRepository) : INotificationRoute
{
    public const string Route = "UserRegistered";

    public NotificationRouteConfiguration RouteConfiguration { get; } = new()
    {
        Name = Route,
        NotificationObjectKind = NotificationObjectKinds.User,
        TemplateName = Route,
        DisplayName = "Регистрация пользователя",
        Description = "Уведомление отправляется при регистрации нового пользователя",
        Tags = ["пользователь", "регистрация", "добро пожаловать"],
        PayloadType = typeof(UserRegisteredRequestData),
        Icon = new("user")
    };

    public Task<IEnumerable<Guid>> ResolveNotificationRecipientsIds(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<UserRegisteredRequestData>();
        
        return Task.FromResult(Enumerable.Empty<Guid>());
        
    }

    public async Task<NotificationFullData> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<UserRegisteredRequestData>();
        if (parameters?.UserId == null)
        {
            throw new ArgumentException("Требуется UserId");
        }

        var user = await userRepository.GetUserByIdAsync(parameters.UserId);
        
        if (user == null)
        {
            throw new ArgumentException($"Пользователь с ID {parameters.UserId} не найден");
        }

        return new NotificationFullData(new UserRegisteredTemplateModel
        {
            UserName = user.Name,
            UserEmail = user.Email,
            RegistrationDate = DateTime.UtcNow,
            WelcomeMessage = parameters.WelcomeMessage ?? "Добро пожаловать в наш сервис!"
        }, "https://example.com");
    }
}

public class UserRegisteredRequestData
{
    public Guid UserId { get; set; }
    public string? WelcomeMessage { get; set; }
}

public class UserRegisteredTemplateModel
{
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public string WelcomeMessage { get; set; } = string.Empty;
}

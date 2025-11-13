using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.UserRegistered;

public class UserRegisteredRouteConfig : INotificationRouteConfiguration
{
    public string Name => "UserRegistered";
    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.User;
    public string TemplateName => "UserRegistered";
    public string DisplayName => "Регистрация пользователя";
    public string Description => "Уведомление отправляется при регистрации нового пользователя";
    public IEnumerable<string> Tags => new[] { "пользователь", "регистрация", "добро пожаловать" };
    public Type PayloadType => typeof(UserRegisteredRequestData);
    public Icon? Icon => new ("user");
}

using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.UserRegistered;

public class UserRegisteredRouteConfig : INotificationRouteConfiguration
{
    public string Name => "UserRegistered";
    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.User;
    public string TemplateName => "UserRegistered";
    public string DisplayName => "User Registration";
    public string Description => "Notification sent when a new user registers";
    public IEnumerable<string> Tags => new[] { "user", "registration", "welcome" };
    public Type PayloadType => typeof(UserRegisteredRequestData);
    public Icon? Icon => new ("user");
}

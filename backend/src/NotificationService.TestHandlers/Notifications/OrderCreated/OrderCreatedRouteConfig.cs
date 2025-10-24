using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.OrderCreated;

public class OrderCreatedRouteConfig : INotificationRouteConfiguration
{
    public string Name => "OrderCreated";
    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.Order;
    public string TemplateName => "OrderCreated";
    public string DisplayName => "Order Created";
    public string Description => "Notification sent when a new order is created";
    public IEnumerable<string> Tags => new[] { "order", "purchase", "confirmation" };
    public Type PayloadType => typeof(OrderCreatedRequestData);
}

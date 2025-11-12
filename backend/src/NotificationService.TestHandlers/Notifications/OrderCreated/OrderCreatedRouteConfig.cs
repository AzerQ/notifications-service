using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.OrderCreated;

public class OrderCreatedRouteConfig : INotificationRouteConfiguration
{
    public string Name => "OrderCreated";
    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.Order;
    public string TemplateName => "OrderCreated";
    public string DisplayName => "Заказ создан";
    public string Description => "Уведомление отправляется при создании нового заказа";
    public IEnumerable<string> Tags => new[] { "заказ", "покупка", "подтверждение" };
    public Type PayloadType => typeof(OrderCreatedRequestData);
    public Icon? Icon => new ("book-a","text-blue-500");
}

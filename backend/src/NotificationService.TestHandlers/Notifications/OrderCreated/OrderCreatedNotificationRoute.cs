using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.OrderCreated;

[NotificationRoute(Name = Route)]
public class OrderCreatedNotificationRoute(IUserRepository userRepository)
    : INotificationRoute
{
    public const string Route = "OrderCreated";

    public NotificationRouteConfiguration RouteConfiguration { get; } = new()
    {
        Name = Route,
        NotificationObjectKind = NotificationObjectKinds.Order,
        TemplateName = Route,
        DisplayName = "Заказ создан",
        Description = "Уведомление отправляется при создании нового заказа",
        Tags = ["заказ", "покупка", "подтверждение"],
        PayloadType = typeof(OrderCreatedRequestData),
        Icon = new ("book-a")
    };

    public Task<IEnumerable<Guid>> ResolveNotificationRecipientsIds(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<OrderCreatedRequestData>();
        
        if (parameters?.CustomerId == null)
        {
            return Task.FromResult(Enumerable.Empty<Guid>());
        }

        return Task.FromResult<IEnumerable<Guid>>([parameters.CustomerId]);
    }
    
    public async Task<NotificationFullData> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<OrderCreatedRequestData>();
        
        if (parameters?.CustomerId == null)
        {
            throw new ArgumentException("Требуется CustomerId");
        }

        var user = await userRepository.GetUserByIdAsync(parameters.CustomerId);
        
        if (user == null)
        {
            throw new ArgumentException($"Покупатель с ID {parameters.CustomerId} не найден");
        }

        return new NotificationFullData(new OrderCreatedTemplateModel
        {
            CustomerName = user.Name,
            OrderNumber = parameters.OrderNumber ?? "N/A",
            OrderTotal = parameters.OrderTotal ?? 0,
            ItemCount = parameters.ItemCount ?? 0,
            OrderDate = DateTime.UtcNow,
            EstimatedDelivery = DateTime.UtcNow.AddDays(3)
        }, "https://example.com");
    }
}

public class OrderCreatedRequestData
{
    public Guid CustomerId { get; set; }
    public string? OrderNumber { get; set; }
    public decimal? OrderTotal { get; set; }
    public int? ItemCount { get; set; }
}

public class OrderCreatedTemplateModel
{
    public string CustomerName { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public decimal OrderTotal { get; set; }
    public int ItemCount { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime EstimatedDelivery { get; set; }
}

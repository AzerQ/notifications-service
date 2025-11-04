using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.TestHandlers.Notifications.OrderCreated;

public class OrderCreatedDataResolver : INotificationDataResolver
{
    private readonly IUserRepository _userRepository;

    public OrderCreatedDataResolver(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public string Route => "OrderCreated";

    public async Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<OrderCreatedRequestData>();
        
        if (parameters?.CustomerId == null)
        {
            return Enumerable.Empty<User>();
        }

        var user = await _userRepository.GetUserByIdAsync(parameters.CustomerId);
        return user != null ? new[] { user } : Enumerable.Empty<User>();
    }

    public async Task<object> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<OrderCreatedRequestData>();
        
        if (parameters?.CustomerId == null)
        {
            throw new ArgumentException("CustomerId is required");
        }

        var user = await _userRepository.GetUserByIdAsync(parameters.CustomerId);
        
        if (user == null)
        {
            throw new ArgumentException($"Customer with ID {parameters.CustomerId} not found");
        }

        return new OrderCreatedTemplateModel
        {
            CustomerName = user.Name,
            OrderNumber = parameters.OrderNumber ?? "N/A",
            OrderTotal = parameters.OrderTotal ?? 0,
            ItemCount = parameters.ItemCount ?? 0,
            OrderDate = DateTime.UtcNow,
            EstimatedDelivery = DateTime.UtcNow.AddDays(3)
        };
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

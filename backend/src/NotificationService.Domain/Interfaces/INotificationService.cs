using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(Notification notification);
    Task<Notification> CreateNotificationAsync(string title, string message, User recipient, NotificationChannel channel, NotificationTemplate? template = null);
}
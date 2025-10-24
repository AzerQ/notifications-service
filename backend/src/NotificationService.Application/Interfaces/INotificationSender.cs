using NotificationService.Domain.Models;

namespace NotificationService.Application.Interfaces;

public interface INotificationSender
{
    Task SendAsync(Notification? notification);
}

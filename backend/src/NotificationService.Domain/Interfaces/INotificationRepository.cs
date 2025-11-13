using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface INotificationRepository
{
    Task SaveNotificationsAsync(params Notification[] notifications);

    Task UpdateNotificationsAsync(params Notification[] notifications);

    Task<IEnumerable<Notification>> GetUserNotifications(Guid userId, GetUserNotificationsRequest userNotificationsRequest);
    Task<Notification?> GetNotificationByIdAsync(Guid id);
    Task MarkAllUserNotificationsAsRead(Guid userId);
}
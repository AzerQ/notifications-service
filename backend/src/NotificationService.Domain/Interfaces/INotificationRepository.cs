using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface INotificationRepository
{
    void SaveNotifications(params Notification[] notifications);

    void UpdateNotifications(params Notification[] notifications);

    void SaveChanges();
    
    void MarkAllUserNotificationsAsRead(Guid userId);

    Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId, GetUserNotificationsRequest userNotificationsRequest);
    Task<Notification?> GetNotificationByIdAsync(Guid id);

}
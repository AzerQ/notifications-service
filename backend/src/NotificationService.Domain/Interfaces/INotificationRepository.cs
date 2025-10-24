using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface INotificationRepository
{
    Task SaveNotificationsAsync(params Notification[] notifications);
    Task<IEnumerable<Notification>> GetNotificationsForUserAsync(Guid userId);
    Task<Notification?> GetNotificationByIdAsync(Guid id);
    Task UpdateNotificationStatusAsync(Guid id, NotificationStatus status);
    Task<IEnumerable<Notification>> GetNotificationsByStatusAsync(NotificationStatus status);
}
using NotificationService.Application.DTOs;
using NotificationService.Domain.Models;
using NotificationService.Domain.Models.InApp;

namespace NotificationService.Application.Interfaces;

public interface INotificationQueryService
{
    Task<NotificationResponseDto?> GetByIdAsync(Guid id);
    Task<IReadOnlyCollection<AppNotification>> GetUserNotifications(Guid userId, GetUserNotificationsRequest userNotificationsRequest);
}

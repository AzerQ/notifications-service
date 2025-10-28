using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Mappers;

public interface INotificationMapper
{
    NotificationResponseDto MapToResponse(IEnumerable<Notification> createdNotifications);
    Task<IEnumerable<Notification>> MapFromRequest(NotificationRequest request, INotificationDataResolver notificationDataResolver, NotificationTemplate template);
    UserDto MapToUserDto(User user);
}

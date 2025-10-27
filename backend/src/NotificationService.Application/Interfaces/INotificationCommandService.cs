using NotificationService.Application.DTOs;

namespace NotificationService.Application.Interfaces;

public interface INotificationCommandService
{
    Task<NotificationResponseDto> ProcessNotificationRequestAsync(NotificationRequest request);
}

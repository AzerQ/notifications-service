using NotificationService.Application.DTOs;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Interfaces;

public interface INotificationCommandService
{
    Task<NotificationResponseDto> ProcessNotificationRequestAsync(NotificationRequest request);
}

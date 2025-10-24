using NotificationService.Application.DTOs;

namespace NotificationService.Application.Interfaces;

public interface INotificationQueryService
{
    Task<NotificationResponseDto?> GetByIdAsync(Guid id);
    Task<IReadOnlyCollection<NotificationResponseDto>> GetByUserAsync(Guid userId);
    Task<IReadOnlyCollection<NotificationResponseDto>> GetByStatusAsync(string status);
}

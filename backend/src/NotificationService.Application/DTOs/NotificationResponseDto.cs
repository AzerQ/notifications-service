using NotificationService.Domain.Models;

namespace NotificationService.Application.DTOs;

public class NotificationResponseDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string Route { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    
    public IEnumerable<UserDto> Recipients { get; set; } = null!;
    
    public IEnumerable<Guid> CreatedNotificationIds { get; set; } = null!;
    
}
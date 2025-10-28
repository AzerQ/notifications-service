namespace NotificationService.Application.DTOs;

public class NotificationResponseDto
{
    public string? Title { get; set; }
    public string Route { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    
    public IEnumerable<UserDto> Recipients { get; set; } = null!;
    
    public IEnumerable<Guid> CreatedNotificationIds { get; set; } = null!;

    public required string StatusMessage {get; set;}
    
}
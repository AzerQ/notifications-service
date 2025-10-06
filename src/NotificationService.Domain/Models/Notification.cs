namespace NotificationService.Domain.Models;

public record Notification
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public required string Route { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public User Recipient { get; set; } = null!;
    public NotificationTemplate? Template { get; set; }
    public NotificationChannel Channel { get; set; }
    public NotificationStatus Status { get; set; } = NotificationStatus.Pending;
    
}
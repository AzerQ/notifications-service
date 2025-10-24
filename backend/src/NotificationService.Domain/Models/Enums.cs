namespace NotificationService.Domain.Models;

public enum NotificationChannel
{
    Email,
    Sms,
    Push
}

public enum NotificationStatus
{
    Pending,
    Sent,
    Failed,
    Delivered
}
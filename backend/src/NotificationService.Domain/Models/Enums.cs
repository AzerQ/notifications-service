using System.Text.Json.Serialization;

namespace NotificationService.Domain.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationChannel
{
    Email,
    Sms,
    Push,
    InApp
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationDeliveryStatus
{
    Pending,
    Skipped,
    Sent,
    Failed,
    Readed
}
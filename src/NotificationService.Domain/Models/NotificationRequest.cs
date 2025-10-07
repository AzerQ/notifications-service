using System.Text.Json;
using System.Text.Json.Serialization;

namespace NotificationService.Domain.Models;

public class NotificationRequest
{
    public string? Title { get; set; }
    public string? Message { get; set; }
    public required string Route { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public NotificationChannel Channel { get; set; } = NotificationChannel.Email;
    public required JsonElement Parameters { get; set; }
}
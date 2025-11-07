using System.Text.Json.Serialization;

namespace NotificationService.Domain.Models;

public class NotificationTemplate
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string CommonContentTemplate {get; set;} = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public List<NotificationChannelTemplate> ChannelsTemplates = null!;
    public string ContentTemplateByChannel(NotificationChannel notificationChannel) =>
        ChannelsTemplates.FirstOrDefault(ct => ct.Channel == notificationChannel)?.Content
        ?? CommonContentTemplate;
}

public class NotificationChannelTemplate {
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required NotificationChannel Channel { get; set; }

    public required string Content {get; set;}

    public string? FilePath {get; set;}

}
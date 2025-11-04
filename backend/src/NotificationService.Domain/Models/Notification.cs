namespace NotificationService.Domain.Models;

public record Notification
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public required string Route { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User Recipient { get; set; } = null!;
    public NotificationTemplate? Template { get; set; }

    public ICollection<NotificationMetadataField> Metadata { get; set; } = new List<NotificationMetadataField>();

     
    public static ICollection<NotificationChannelDeliveryStatus>  ChannelsDefaultState(params NotificationChannel[] notificationChannels)
    {
        var result = new List<NotificationChannelDeliveryStatus>();
        foreach (var channel in notificationChannels)
        {
            result.Add(new NotificationChannelDeliveryStatus{ NotificationChannel = channel, DeliveryStatus = NotificationDeliveryStatus.Pending});
        }
        return result;
    }

    public ICollection<NotificationChannelDeliveryStatus> DeliveryChannelsState { get; set; }
    = ChannelsDefaultState(NotificationChannel.Email, NotificationChannel.Push);


}

public record NotificationChannelDeliveryStatus
{
    public NotificationChannel NotificationChannel { get; init; }
    public NotificationDeliveryStatus DeliveryStatus { get; set; }

    public Guid NotificationId { get; set; }

    public Notification Notification { get; set; } = null!;

    public Guid Id { get; init; } = Guid.NewGuid();

}


public record NotificationMetadataField
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Description { get; set; }

    public Guid NotificationId { get; set; }

    public Notification Notification { get; set; } = null!;
}
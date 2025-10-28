namespace NotificationService.Domain.Models;

public static class NotificationValidator
{
    public static ValidationResult Validate(Notification? notification)
    {
        var result = new ValidationResult();

        if (notification is null)
        {
            result.AddError("Notification is required.");
            return result;
        }

        if (string.IsNullOrWhiteSpace(notification.Title))
        {
            result.AddError("Title is required.");
        }

        if (notification.Recipient is null)
        {
            result.AddError("Recipient is required.");
        }
        else
        {
            foreach (var channel in notification.DeliveryChannelsState.Select(s => s.NotificationChannel))
                switch (channel)
                {
                    case NotificationChannel.Email when string.IsNullOrWhiteSpace(notification.Recipient.Email):
                        result.AddError("Recipient email is required for email notifications.");
                        break;
                    case NotificationChannel.Sms when string.IsNullOrWhiteSpace(notification.Recipient.PhoneNumber):
                        result.AddError("Recipient phone number is required for SMS notifications.");
                        break;
                    // case NotificationChannel.Push when string.IsNullOrWhiteSpace(notification.Recipient.DeviceToken):
                    //     result.AddError("Recipient device token is required for push notifications.");
                    //     break;
                }
        }

        if (notification.Template is null && string.IsNullOrWhiteSpace(notification.Message))
        {
            result.AddError("Either message text or template must be provided.");
        }

        return result;
    }
}

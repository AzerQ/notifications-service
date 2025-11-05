using NotificationService.Domain.Models;
using NotificationService.Domain.Models.InApp;

namespace NotificationService.Application.Mappers
{
    public class InAppNotificationMapper
    {
        public InAppNotification Map(Notification notification)
        {
            return new InAppNotification
            {
                Id = notification.Id.ToString(),
                Content = notification.Message,
                Date = notification.CreatedAt,
                Type = notification.Route,
                Title = notification.Title,
                Read = false // Assuming default value
            };
        }
    }
}
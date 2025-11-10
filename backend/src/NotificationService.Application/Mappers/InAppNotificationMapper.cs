using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Domain.Models.InApp;

namespace NotificationService.Application.Mappers
{
    public class InAppNotificationMapper
    {
        public AppNotification Map
        (
            Notification notification,
            INotificationRouteConfiguration routeConfiguration,
            List<NotificationAction>? notificationActions = null,
            List<NotificationParameter>? notificationParameters = null
        )
                {
                    return new AppNotification
                    {
                        Id = notification.Id,
                        ReceiverId = notification.RecipientId.ToString(), 
                        Content = notification.Message,
                        Date = notification.CreatedAt,
                        Type = routeConfiguration.NotificationObjectKind.DisplayName,
                        SubType = routeConfiguration.DisplayName,
                        Title = notification.Title,
                        Hashtags = [.. routeConfiguration.Tags],
                        Url = notification.Url,
                        Actions = notificationActions,
                        Parameters = notificationParameters,
                        Read = false, // Assuming default value,
                        Icon = routeConfiguration.Icon
                    };
                }
    }
}
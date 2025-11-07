using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services
{
    public class InAppNotificationProcessor(
        IInAppNotificationSender sender,
        InAppNotificationMapper mapper,
        NotificationRoutesContext notificationRoutesContext)
    {

        public async Task ProcessAsync(Notification notification)
        {
            var inAppNotification = mapper.Map(notification, notificationRoutesContext.GetNotificationRouteConfiguration(notification.Route));
            await sender.SendToUsersAsync(inAppNotification);
            
        }
    }
}
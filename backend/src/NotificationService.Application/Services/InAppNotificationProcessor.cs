using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services
{
    public class InAppNotificationProcessor(
        IInAppNotificationSender sender,
        InAppNotificationMapper mapper)
    {

        public async Task ProcessAsync(Notification notification,  NotificationRouteConfiguration routeConfiguration)
        {
            var inAppNotification = mapper.Map(notification, routeConfiguration);
            await sender.SendToUsersAsync(inAppNotification);
            
        }
    }
}
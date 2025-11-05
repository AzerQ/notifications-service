using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services
{
    public class InAppNotificationProcessor
    {
        private readonly IInAppNotificationSender _sender;

        public InAppNotificationProcessor(IInAppNotificationSender sender)
        {
            _sender = sender;
        }

        public async Task ProcessAsync(Notification notification)
        {
            var userIds = new[] { notification.Recipient.Id.ToString() };
            await _sender.SendToUsersAsync(userIds, notification.Title, notification.Message, notification.Route, notification.CreatedAt);
        }
    }
}
using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NotificationService.Application.Services
{
    public class InAppNotificationProcessor
    {
        private readonly IInAppNotificationSender _sender;
        private readonly InAppNotificationMapper _mapper;
        
        public InAppNotificationProcessor(IInAppNotificationSender sender, InAppNotificationMapper mapper)
        {
            _sender = sender;
            _mapper = mapper;
        }
        
        public async Task ProcessAsync(Notification notification)
        {
            var inAppNotification = _mapper.Map(notification);
            
            if (notification.Recipient != null)
            {
                var userIds = new[] { notification.Recipient.Id.ToString() };
                await _sender.SendToUsersAsync(userIds, inAppNotification);
            }
            else
            {
                await _sender.SendToAllAsync(inAppNotification);
            }
        }
    }
}
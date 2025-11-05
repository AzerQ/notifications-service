
using NotificationService.Domain.Models.InApp;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NotificationService.Application.Interfaces
{
    public interface IInAppNotificationSender
    {
        Task SendToAllAsync(InAppNotification notification);
        Task SendToUsersAsync(IEnumerable<string> userIds, InAppNotification notification);
    }
}
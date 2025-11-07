
using NotificationService.Domain.Models.InApp;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NotificationService.Application.Interfaces
{
    public interface IInAppNotificationSender
    {
        Task SendToAllAsync(AppNotification notification);
        Task SendToUsersAsync(AppNotification notification);
    }
}
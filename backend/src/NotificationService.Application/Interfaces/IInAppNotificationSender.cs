
namespace NotificationService.Application.Interfaces
{
    public interface IInAppNotificationSender
    {
        Task SendToAllAsync(string title, string message, DateTime createdAt);
        Task SendToUsersAsync(IEnumerable<string> userIds, string title, string message, string route, DateTime createdAt);
    }
}
using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.Interfaces;

namespace NotificationService.Api.Hubs
{
    public class SignalRNotificationSender : IInAppNotificationSender
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRNotificationSender(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToAllAsync(string title, string message, DateTime createdAt)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
            {
                id = Guid.NewGuid(),
                title,
                message,
                createdAt
            });
        }

        public async Task SendToUsersAsync(IEnumerable<string> userIds, string title, string message, string route, DateTime createdAt)
        {
            foreach (var userId in userIds)
            {
                await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new
                {
                    id = Guid.NewGuid(),
                    title,
                    message,
                    route,
                    createdAt,
                    userId
                });
            }
        }
    }
}
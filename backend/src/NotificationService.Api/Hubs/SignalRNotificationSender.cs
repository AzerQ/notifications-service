using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models.InApp;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NotificationService.Api.Hubs
{
    public class SignalRNotificationSender : IInAppNotificationSender
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRNotificationSender(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToAllAsync(AppNotification notification)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
        }

        public async Task SendToUsersAsync(AppNotification notification)
        {
            await _hubContext.Clients.User(notification.ReceiverId).SendAsync("ReceiveNotification", notification);
        }
    }
}
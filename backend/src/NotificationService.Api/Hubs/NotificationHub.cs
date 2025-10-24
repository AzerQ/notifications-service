using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Api.Hubs;

/// <summary>
/// SignalR hub for real-time notifications
/// </summary>
public class NotificationHub : Hub
{
    /// <summary>
    /// Called when a client connects to the hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
    }

    /// <summary>
    /// Send notification to a specific user
    /// </summary>
    public async Task SendNotificationToUser(string userId, object notification)
    {
        await Clients.User(userId).SendAsync("ReceiveNotification", notification);
    }

    /// <summary>
    /// Send notification to all connected clients
    /// </summary>
    public async Task BroadcastNotification(object notification)
    {
        await Clients.All.SendAsync("ReceiveNotification", notification);
    }
}

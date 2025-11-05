using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Api.Authentication.Extensions;

namespace NotificationService.Api.Hubs;

/// <summary>
/// SignalR hub for real-time notifications with JWT authentication
/// Supports sending InApp notifications to specific users across all their connected devices
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub
    /// Requires JWT authentication via access_token query parameter
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        try
        {
            var user = Context.User?.GetApplicationUser();

            if (user == null)
            {
                _logger.LogWarning($"Connection attempt without valid user. ConnectionId: {Context.ConnectionId}");
                Context.Abort();
                return;
            }

            _logger.LogInformation(
                $"User connected - UserId: {user.Id}, UserName: {user.Name}, UserEmail: {user.Email}, ConnectionId: {Context.ConnectionId}");

            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error during connection. ConnectionId: {Context.ConnectionId}");
            Context.Abort();
        }
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var user = Context.User?.GetApplicationUser();

            _logger.LogInformation(
                $"User disconnected - UserId: {user?.Id}, UserName: {user?.Name}, ConnectionId: {Context.ConnectionId}, Exception: {exception?.Message}");

            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error during disconnection. ConnectionId: {Context.ConnectionId}");
        }
    }

    /// <summary>
    /// Send InApp notification to a specific user across all their connected devices
    /// </summary>
    /// <param name="userId">Target user ID (Guid as string)</param>
    /// <param name="notification">Notification object to send</param>
    public async Task SendInAppNotificationToUser(string userId, object notification)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("SendInAppNotificationToUser called with empty userId");
                return;
            }

            var currentUser = Context.User?.GetApplicationUser();
            _logger.LogInformation(
                $"Sending InApp notification to user {userId} from user {currentUser?.Id}. ConnectionId: {Context.ConnectionId}");

            // Send to all connections of the target user
            await Clients.User(userId).SendAsync("ReceiveInAppNotification", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending InApp notification to user {userId}");
        }
    }

    /// <summary>
    /// Send notification to all connected clients
    /// </summary>
    public async Task BroadcastNotification(object notification)
    {
        try
        {
            var currentUser = Context.User?.GetApplicationUser();
            _logger.LogInformation(
                $"Broadcasting notification from user {currentUser?.Id}. ConnectionId: {Context.ConnectionId}");

            await Clients.All.SendAsync("ReceiveNotification", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
        }
    }
}

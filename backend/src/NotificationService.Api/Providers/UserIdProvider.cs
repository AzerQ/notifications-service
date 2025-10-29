using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Api.Providers;

public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Get user ID from JWT token claims
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}

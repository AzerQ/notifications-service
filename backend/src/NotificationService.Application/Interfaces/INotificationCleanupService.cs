namespace NotificationService.Application.Interfaces;

/// <summary>
/// Service for cleaning up old notifications
/// </summary>
public interface INotificationCleanupService
{
    /// <summary>
    /// Deletes notifications older than the specified number of days
    /// </summary>
    /// <param name="retentionDays">Number of days to retain notifications</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of notifications deleted</returns>
    Task<int> CleanupOldNotificationsAsync(int retentionDays, CancellationToken cancellationToken = default);
}

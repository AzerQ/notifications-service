using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NotificationService.Application.Interfaces;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Services;

/// <summary>
/// Service for cleaning up old notifications from the database
/// </summary>
public class NotificationCleanupService : INotificationCleanupService
{
    private readonly NotificationDbContext _dbContext;
    private readonly ILogger<NotificationCleanupService> _logger;

    public NotificationCleanupService(
        NotificationDbContext dbContext,
        ILogger<NotificationCleanupService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<int> CleanupOldNotificationsAsync(int retentionDays, CancellationToken cancellationToken = default)
    {
        if (retentionDays <= 0)
        {
            _logger.LogWarning("Invalid retention period: {RetentionDays}. Must be greater than 0.", retentionDays);
            return 0;
        }

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
        
        _logger.LogInformation(
            "Starting notification cleanup. Deleting notifications older than {CutoffDate} (retention period: {RetentionDays} days)", 
            cutoffDate, 
            retentionDays);

        try
        {
            var oldNotifications = await _dbContext.Notifications
                .Where(n => n.CreatedAt < cutoffDate)
                .ToListAsync(cancellationToken);

            if (oldNotifications.Count == 0)
            {
                _logger.LogInformation("No old notifications found to delete.");
                return 0;
            }

            _dbContext.Notifications.RemoveRange(oldNotifications);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully deleted {Count} notifications older than {CutoffDate}", 
                oldNotifications.Count, 
                cutoffDate);

            return oldNotifications.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while cleaning up old notifications");
            throw;
        }
    }
}

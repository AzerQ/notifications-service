using Microsoft.Extensions.Options;
using NotificationService.Api.Configuration;
using NotificationService.Application.Interfaces;
using Quartz;

namespace NotificationService.Api.Jobs;

/// <summary>
/// Scheduled job for cleaning up old notifications
/// </summary>
[DisallowConcurrentExecution]
public class NotificationCleanupJob : IJob
{
    private readonly INotificationCleanupService _cleanupService;
    private readonly IOptions<NotificationCleanupOptions> _options;
    private readonly ILogger<NotificationCleanupJob> _logger;

    public NotificationCleanupJob(
        INotificationCleanupService cleanupService,
        IOptions<NotificationCleanupOptions> options,
        ILogger<NotificationCleanupJob> logger)
    {
        _cleanupService = cleanupService;
        _options = options;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var retentionDays = _options.Value.RetentionDays;
        
        _logger.LogInformation(
            "Notification cleanup job started. Job ID: {JobId}, Scheduled Fire Time: {ScheduledFireTime}", 
            context.JobDetail.Key, 
            context.ScheduledFireTimeUtc);

        try
        {
            var deletedCount = await _cleanupService.CleanupOldNotificationsAsync(
                retentionDays, 
                context.CancellationToken);

            _logger.LogInformation(
                "Notification cleanup job completed successfully. Deleted {DeletedCount} notifications. Retention period: {RetentionDays} days",
                deletedCount,
                retentionDays);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Notification cleanup job failed");
            throw new JobExecutionException(ex, refireImmediately: false);
        }
    }
}

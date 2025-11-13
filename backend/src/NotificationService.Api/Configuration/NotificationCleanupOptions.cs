namespace NotificationService.Api.Configuration;

/// <summary>
/// Configuration options for the notification cleanup job
/// </summary>
public class NotificationCleanupOptions
{
    /// <summary>
    /// Number of days to retain notifications. Notifications older than this will be deleted.
    /// Default: 60 days (approximately 2 months)
    /// </summary>
    public int RetentionDays { get; set; } = 60;

    /// <summary>
    /// Cron expression for scheduling the cleanup job.
    /// Default: "0 0 2 * * ?" (runs daily at 2:00 AM)
    /// </summary>
    public string Schedule { get; set; } = "0 0 2 * * ?";

    /// <summary>
    /// Whether the cleanup job is enabled
    /// </summary>
    public bool Enabled { get; set; } = true;
}

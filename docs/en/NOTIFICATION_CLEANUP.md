# Notification Cleanup Feature

## Overview

The notification cleanup feature is a scheduled background service that automatically deletes notifications older than a configurable retention period. This helps maintain database performance and manage storage by removing old notification data.

## Configuration

The cleanup service is configured in `appsettings.json` under the `NotificationCleanup` section:

```json
{
  "NotificationCleanup": {
    "RetentionDays": 60,
    "Schedule": "0 0 2 * * ?",
    "Enabled": true
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `RetentionDays` | integer | 60 | Number of days to retain notifications. Notifications older than this will be deleted. |
| `Schedule` | string | "0 0 2 * * ?" | Cron expression for scheduling the cleanup job. Default runs daily at 2:00 AM UTC. |
| `Enabled` | boolean | true | Enable or disable the cleanup job. |

## Cron Schedule Format

The schedule uses Quartz.NET cron expressions with the following format:

```
┌───────────── second (0 - 59)
│ ┌───────────── minute (0 - 59)
│ │ ┌───────────── hour (0 - 23)
│ │ │ ┌───────────── day of month (1 - 31)
│ │ │ │ ┌───────────── month (1 - 12)
│ │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │ │
│ │ │ │ │ │
* * * * * ?
```

### Schedule Examples

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Daily at 2 AM | `0 0 2 * * ?` | Default - Runs every day at 2:00 AM |
| Every 12 hours | `0 0 */12 * * ?` | Runs at midnight and noon |
| Weekly on Sunday | `0 0 2 ? * 1` | Runs every Sunday at 2:00 AM |
| Monthly on 1st | `0 0 2 1 * ?` | Runs on the 1st of each month at 2:00 AM |
| Every 6 hours | `0 0 */6 * * ?` | Runs every 6 hours |

## How It Works

1. **Scheduled Execution**: The cleanup job runs according to the configured schedule using Quartz.NET
2. **Retention Check**: The service calculates a cutoff date by subtracting `RetentionDays` from the current UTC time
3. **Notification Deletion**: All notifications with `CreatedAt` timestamp older than the cutoff date are deleted
4. **Logging**: The service logs information about:
   - When the cleanup job starts
   - The retention period being used
   - Number of notifications deleted
   - Any errors that occur during cleanup

## Monitoring

The cleanup service logs important events:

```
[Information] Starting notification cleanup. Deleting notifications older than 2023-09-13T02:00:00.000Z (retention period: 60 days)
[Information] Successfully deleted 150 notifications older than 2023-09-13T02:00:00.000Z
```

## Disabling the Cleanup Service

To disable the cleanup service, set `Enabled` to `false` in the configuration:

```json
{
  "NotificationCleanup": {
    "Enabled": false
  }
}
```

## Testing

The cleanup service includes comprehensive unit tests that verify:
- Deletion of old notifications
- Preservation of recent notifications
- Handling of invalid retention periods
- Proper cancellation support
- Deletion of multiple old notifications

Run the tests with:

```bash
dotnet test --filter "FullyQualifiedName~NotificationCleanupServiceTests"
```

## Best Practices

1. **Retention Period**: Choose a retention period that balances compliance requirements with database performance
2. **Schedule**: Run cleanup during off-peak hours (e.g., 2 AM) to minimize impact
3. **Monitoring**: Regularly check logs to ensure cleanup is working as expected
4. **Backup**: Ensure you have database backups before reducing the retention period significantly
5. **Testing**: Test configuration changes in a non-production environment first

## Technical Details

- **Technology**: Uses Quartz.NET for reliable job scheduling
- **Concurrency**: Jobs are configured with `DisallowConcurrentExecution` to prevent overlapping runs
- **Database**: Uses Entity Framework Core for efficient batch deletion
- **Logging**: Integrates with Microsoft.Extensions.Logging for consistent logging

## Troubleshooting

### Cleanup job not running

1. Check that `Enabled` is set to `true` in configuration
2. Verify the cron expression is valid
3. Check application logs for errors during job initialization

### Too many notifications being deleted

1. Verify the `RetentionDays` value is correct
2. Check system time/timezone settings
3. Review logs to see which notifications are being deleted

### Performance issues

1. Consider running cleanup less frequently
2. Increase `RetentionDays` to reduce the number of deletions
3. Schedule cleanup during off-peak hours

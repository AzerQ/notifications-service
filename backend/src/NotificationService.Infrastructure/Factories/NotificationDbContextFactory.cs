using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Factories;

public class NotificationDbContextFactory : IDesignTimeDbContextFactory<NotificationDbContext>
{
    public NotificationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<NotificationDbContext>()
            .UseSqlite("Data Source=notifications.db")
            .Options;
        return new NotificationDbContext(options);
    }
}

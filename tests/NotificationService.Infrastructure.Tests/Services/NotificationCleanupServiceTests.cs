using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;
using NotificationService.Infrastructure.Services;

namespace NotificationService.Infrastructure.Tests.Services;

public class NotificationCleanupServiceTests
{
    private static NotificationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<NotificationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new NotificationDbContext(options);
    }

    [Fact]
    public async Task CleanupOldNotificationsAsync_ShouldDeleteOldNotifications()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var logger = Mock.Of<ILogger<NotificationCleanupService>>();
        var service = new NotificationCleanupService(dbContext, logger);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "testuser",
            Email = "test@example.com"
        };
        await dbContext.Users.AddAsync(user);

        var oldNotification = new Notification
        {
            Id = Guid.NewGuid(),
            Title = "Old Notification",
            Message = "This is old",
            Route = "test",
            CreatedAt = DateTime.UtcNow.AddDays(-90),
            RecipientId = user.Id,
            TemplateId = "test-template",
            TemplateData = new { },
            Url = "https://example.com/old"
        };

        var recentNotification = new Notification
        {
            Id = Guid.NewGuid(),
            Title = "Recent Notification",
            Message = "This is recent",
            Route = "test",
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            RecipientId = user.Id,
            TemplateId = "test-template",
            TemplateData = new { },
            Url = "https://example.com/recent"
        };

        await dbContext.Notifications.AddRangeAsync(oldNotification, recentNotification);
        await dbContext.SaveChangesAsync();

        // Act
        var deletedCount = await service.CleanupOldNotificationsAsync(60);

        // Assert
        deletedCount.Should().Be(1);
        var remainingNotifications = await dbContext.Notifications.ToListAsync();
        remainingNotifications.Should().HaveCount(1);
        remainingNotifications[0].Id.Should().Be(recentNotification.Id);
    }

    [Fact]
    public async Task CleanupOldNotificationsAsync_ShouldReturnZero_WhenNoOldNotifications()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var logger = Mock.Of<ILogger<NotificationCleanupService>>();
        var service = new NotificationCleanupService(dbContext, logger);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "testuser",
            Email = "test@example.com"
        };
        await dbContext.Users.AddAsync(user);

        var recentNotification = new Notification
        {
            Id = Guid.NewGuid(),
            Title = "Recent Notification",
            Message = "This is recent",
            Route = "test",
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            RecipientId = user.Id,
            TemplateId = "test-template",
            TemplateData = new { },
            Url = "https://example.com/recent"
        };

        await dbContext.Notifications.AddAsync(recentNotification);
        await dbContext.SaveChangesAsync();

        // Act
        var deletedCount = await service.CleanupOldNotificationsAsync(60);

        // Assert
        deletedCount.Should().Be(0);
        var remainingNotifications = await dbContext.Notifications.ToListAsync();
        remainingNotifications.Should().HaveCount(1);
    }

    [Fact]
    public async Task CleanupOldNotificationsAsync_ShouldReturnZero_WhenRetentionDaysIsInvalid()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var logger = Mock.Of<ILogger<NotificationCleanupService>>();
        var service = new NotificationCleanupService(dbContext, logger);

        // Act
        var deletedCount = await service.CleanupOldNotificationsAsync(0);

        // Assert
        deletedCount.Should().Be(0);
    }

    [Fact]
    public async Task CleanupOldNotificationsAsync_ShouldDeleteMultipleOldNotifications()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var logger = Mock.Of<ILogger<NotificationCleanupService>>();
        var service = new NotificationCleanupService(dbContext, logger);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "testuser",
            Email = "test@example.com"
        };
        await dbContext.Users.AddAsync(user);

        var oldNotifications = new List<Notification>
        {
            new Notification
            {
                Id = Guid.NewGuid(),
                Title = "Old 1",
                Message = "Old message 1",
                Route = "test",
                CreatedAt = DateTime.UtcNow.AddDays(-100),
                RecipientId = user.Id,
                TemplateId = "test-template",
                TemplateData = new { },
                Url = "https://example.com/old1"
            },
            new Notification
            {
                Id = Guid.NewGuid(),
                Title = "Old 2",
                Message = "Old message 2",
                Route = "test",
                CreatedAt = DateTime.UtcNow.AddDays(-80),
                RecipientId = user.Id,
                TemplateId = "test-template",
                TemplateData = new { },
                Url = "https://example.com/old2"
            },
            new Notification
            {
                Id = Guid.NewGuid(),
                Title = "Old 3",
                Message = "Old message 3",
                Route = "test",
                CreatedAt = DateTime.UtcNow.AddDays(-70),
                RecipientId = user.Id,
                TemplateId = "test-template",
                TemplateData = new { },
                Url = "https://example.com/old3"
            }
        };

        await dbContext.Notifications.AddRangeAsync(oldNotifications);
        await dbContext.SaveChangesAsync();

        // Act
        var deletedCount = await service.CleanupOldNotificationsAsync(60);

        // Assert
        deletedCount.Should().Be(3);
        var remainingNotifications = await dbContext.Notifications.ToListAsync();
        remainingNotifications.Should().BeEmpty();
    }

    [Fact]
    public async Task CleanupOldNotificationsAsync_ShouldHandleCancellation()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var logger = Mock.Of<ILogger<NotificationCleanupService>>();
        var service = new NotificationCleanupService(dbContext, logger);

        var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => service.CleanupOldNotificationsAsync(60, cts.Token));
    }
}

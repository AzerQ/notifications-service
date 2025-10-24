using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Templates;

namespace NotificationService.Infrastructure.Data.Init;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var scopedProvider = scope.ServiceProvider;
        var logger = scopedProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");

        try
        {
            var context = scopedProvider.GetRequiredService<NotificationDbContext>();
            await context.Database.MigrateAsync();

            ITemplateLoader templateLoader = scopedProvider.GetRequiredService<ITemplateLoader>();
            await templateLoader.LoadTemplatesAsync();
            
            if (!await context.Users.AnyAsync())
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Test User",
                    Email = "test@example.com",
                    CreatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(user);
            }

            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка инициализации БД");
            throw;
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NotificationService.Domain.Models;

namespace NotificationService.Infrastructure.Data.Init;

public static class ServiceInitializer
{

    private static void SeedTestUsers(IConfiguration configuration, NotificationDbContext notificationDbContext)
    {
       var users =  configuration.GetSection("SeedUsers").Get<List<User>>() ?? [];
       notificationDbContext.Users.AddRange(users);
    }

    public static async Task InitializeAsync(IServiceProvider services, IConfiguration configutation, bool isProduction = true)
    {
        using var scope = services.CreateScope();
        var scopedProvider = scope.ServiceProvider;
        var logger = scopedProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");

        try
        {
            var context = scopedProvider.GetRequiredService<NotificationDbContext>();
            
            if (isProduction)
                await context.Database.MigrateAsync();
            else 
                await context.Database.EnsureCreatedAsync();
            
            if (!isProduction && !await context.Users.AnyAsync())
            {
               SeedTestUsers(configutation, context);
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

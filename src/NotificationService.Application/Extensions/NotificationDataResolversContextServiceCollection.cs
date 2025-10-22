using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Extensions;

public static class NotificationDataResolversContextServiceCollection
{
    public static IServiceCollection AddNotificationDataResolversContext(this IServiceCollection serviceCollection, 
        params Assembly[] notificationAssemblies)
    {
        return serviceCollection.Scan(scan =>
            scan
                .FromAssemblies(notificationAssemblies)
                
                .AddClasses(classes => classes.AssignableTo(typeof(INotificationDataResolver)))
                .AsSelf()
                .WithTransientLifetime()
                
                .AddClasses(classes => classes.AssignableTo<INotificationRouteConfiguration>())
                .AsSelf()
                .WithSingletonLifetime()
            )
            
            .AddSingleton(serviceProvider =>
            {
                var notificationDataResolversContext = new NotificationRoutesContext(serviceProvider);
                foreach (var notificationAssembly in notificationAssemblies)
                {
                    notificationDataResolversContext.AddNotificationServicesFromAssembly(notificationAssembly);
                }
                return notificationDataResolversContext;
            });
    }
}
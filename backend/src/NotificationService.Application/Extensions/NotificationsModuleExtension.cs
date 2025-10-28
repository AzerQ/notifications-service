using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Extensions;

public static class NotificationsModuleExtension
{
    public static IServiceCollection AddNotificationsServiceModule(this IServiceCollection serviceCollection, 
        IConfiguration configuration,
        params Assembly[] notificationAssemblies)
    {

        IEnumerable<INotificationServicesRegister> customServiceRegistrars = notificationAssemblies
            .SelectMany(assembly => assembly.GetImplementingTypes(typeof(INotificationServicesRegister)))
            .Select(type => (INotificationServicesRegister)Activator.CreateInstance(type)!);

            foreach (var registrar in customServiceRegistrars)
            {
                registrar.RegisterServices(serviceCollection, configuration);
            }

            return serviceCollection.Scan(scan =>
            scan
                .FromAssemblies(notificationAssemblies)
                
                .AddClasses(classes => classes.AssignableTo(typeof(INotificationDataResolver)))
                .AsSelf()
                .WithSingletonLifetime()
                
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
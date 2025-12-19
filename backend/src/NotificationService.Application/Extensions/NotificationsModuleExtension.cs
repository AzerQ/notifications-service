using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Interfaces;

namespace NotificationService.Application.Extensions;

public enum ServiceScope {Transient, Scoped, Singleton};
    
public delegate string ServiceKeyResolver(Type serviceType, Type implementationType);


public static class NotificationsModuleExtension
{
    public static IServiceCollection RegisterAllServiceImplementationAsKeyedServices(this IServiceCollection serviceCollection, Assembly assembly, Type serviceType,
        ServiceKeyResolver serviceKeyResolver, ServiceScope serviceScope = ServiceScope.Scoped)
    {
        var implTypes = assembly.GetImplementingTypes(serviceType);
        foreach (var implType in implTypes)
        {
            var serviceKey = serviceKeyResolver(serviceType, implType);
            
            var _ = serviceScope switch
            {
                ServiceScope.Scoped => serviceCollection.AddKeyedScoped(serviceType, serviceKey, implType),
                ServiceScope.Transient => serviceCollection.AddKeyedTransient(serviceType, serviceKey, implType),
                ServiceScope.Singleton => serviceCollection.AddKeyedSingleton(serviceType, serviceKey, implType),
                _ => throw new ArgumentOutOfRangeException(nameof(serviceScope), serviceScope, null)
            };
            
        }
        return serviceCollection;
    }
    
    public static IServiceCollection AddNotificationsServiceModules(this IServiceCollection serviceCollection, 
        ConfigurationManager configuration,
        params Assembly[] notificationAssemblies)
    {
        IEnumerable<INotificationsModuleServicesRegister> customServiceRegistrars = notificationAssemblies
            .SelectMany(assembly => assembly.GetImplementingTypes(typeof(INotificationsModuleServicesRegister)))
            .Select(type => (INotificationsModuleServicesRegister)Activator.CreateInstance(type)!);

            foreach (var notificationsModuleServicesRegister in customServiceRegistrars)
            {
                notificationsModuleServicesRegister.RegisterServices(serviceCollection, configuration);
            }

            foreach (var notificationsModuleAssembly in notificationAssemblies)
            {
                serviceCollection.RegisterAllServiceImplementationAsKeyedServices(notificationsModuleAssembly, typeof(INotificationRoute), 
                (_, implementationType) => 
                    implementationType.GetCustomAttribute<NotificationRouteAttribute>()?.Name ?? 
                    throw new KeyNotFoundException($"Notification route attribute not found for type {implementationType}"));
            }
            
            return serviceCollection;

    }
}
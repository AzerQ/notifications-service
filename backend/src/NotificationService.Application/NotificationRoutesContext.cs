using System.Reflection;
using NotificationService.Application.Extensions;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application;

public class NotificationRoutesContext(IServiceProvider serviceProvider)
{
    
    private Dictionary<string, INotificationDataResolver> _notificationDataResolvers = new();
    private Dictionary<string, INotificationRouteConfiguration> _notificationRoutes = new();
    
    public NotificationRoutesContext AddNotificationDataResolver(INotificationDataResolver notificationDataResolver)
    {
        _notificationDataResolvers.Add(notificationDataResolver.Route, notificationDataResolver);
        return this;
    }
    
    public NotificationRoutesContext AddNotificationRoteConfig(INotificationRouteConfiguration notificationRouteConfiguration)
    {
        _notificationRoutes.Add(notificationRouteConfiguration.Name, notificationRouteConfiguration);
        return this;
    }


    public NotificationRoutesContext AddFromType(Type impType)
    {
        var serviceObj = serviceProvider.GetService(impType);

        return serviceObj switch
        {
            INotificationDataResolver notificationDataResolver => AddNotificationDataResolver(notificationDataResolver),
            INotificationRouteConfiguration notificationRouteConfiguration => AddNotificationRoteConfig(
                notificationRouteConfiguration),
            _ => throw new Exception($"Cannot resolve service {impType.FullName} from DI")
        };
    }

    public NotificationRoutesContext AddNotificationServicesFromAssembly(Assembly assembly)
    {
        var resolverTypes = assembly.GetImplementingTypes(typeof(INotificationDataResolver));
        var notificationRouteConfigurationTypes = assembly.GetImplementingTypes(typeof(INotificationRouteConfiguration));
        
        Type[] allServicesTypes = [..resolverTypes, ..notificationRouteConfigurationTypes];
        foreach (var service in allServicesTypes)
        {
            AddFromType(service);
        }
        return this;
    }

    public INotificationDataResolver GetDataResolverForRoute(string route)
    {
        var resolver = _notificationDataResolvers[route];
        
        if (resolver == null) 
            throw new KeyNotFoundException("No notification resolver found for route: " + route);
        return resolver;
    }

    public INotificationRouteConfiguration GetNotificationRouteConfiguration(string route)
    {
        var routeConfig = _notificationRoutes[route];
        if (routeConfig == null) 
            throw new KeyNotFoundException("No notification route config found for route: " + route);
        return routeConfig;
    }
    
    public IEnumerable<INotificationRouteConfiguration> GetAllNotificationRouteConfigurations()
    {
        return _notificationRoutes.Values;
    }
}
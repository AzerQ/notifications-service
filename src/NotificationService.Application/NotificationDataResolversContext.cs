using System.Reflection;
using NotificationService.Application.Extensions;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application;

public class NotificationDataResolversContext(IServiceProvider serviceProvider)
{
    
    private List<INotificationDataResolver> _notificationDataResolvers = new();

    public NotificationDataResolversContext AddNotificationDataResolver(INotificationDataResolver notificationDataResolver)
    {
        _notificationDataResolvers.Add(notificationDataResolver);
        return this;
    }

    public NotificationDataResolversContext AddFromType(Type impType)
    {
        var notificationDataResolverObj = serviceProvider.GetService(impType);
        if (notificationDataResolverObj is INotificationDataResolver notificationDataResolver)
            _notificationDataResolvers.Add(notificationDataResolver);
        else
            throw new Exception($"Cannot resolve notification data resolver type: {impType.FullName}");
        return this;
    }

    public NotificationDataResolversContext AddResolversFromAssembly(Assembly assembly)
    {
        var resolverTypes = assembly.GetImplementingTypes(typeof(INotificationDataResolver));
        foreach (var resolverType in resolverTypes)
        {
            AddFromType(resolverType);
        }
        return this;
    }

    public INotificationDataResolver GetForRoute(string route)
    {
        var resolver = _notificationDataResolvers.FirstOrDefault(notificationDataResolver => notificationDataResolver.Route == route);
        if (resolver == null) 
            throw new KeyNotFoundException("No notification resolver found for route: " + route);
        return resolver;
    }
}
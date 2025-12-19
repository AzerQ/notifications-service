using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Services;

public class NotificationRoutesService(IServiceProvider serviceProvider) : INotificationRoutesService
{
    private readonly IServiceScope _serviceScope = serviceProvider.CreateScope();
    
    public void Dispose()
    {
        _serviceScope.Dispose();
    }

    public INotificationRoute GetNotificationRouteByName(string routeName)
    { 
        return _serviceScope.ServiceProvider.GetKeyedService<INotificationRoute>(routeName) ?? throw new KeyNotFoundException($"NotificationRoute {routeName} not found");
    }

    public IEnumerable<NotificationRouteConfiguration> GetAllNotificationRoutesConfigurations()
    {
        return GetAllNotificationRoutes().Select(r => r.RouteConfiguration);
    }

    private IEnumerable<INotificationRoute> GetAllNotificationRoutes()
    {
        return _serviceScope.ServiceProvider.GetKeyedServices<INotificationRoute>(KeyedService.AnyKey);
    }
}
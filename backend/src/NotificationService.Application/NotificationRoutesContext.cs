using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Extensions;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application;

/// <summary>
/// Центральный реестр маршрутов уведомлений и их обработчиков.
/// Управляет регистрацией и получением резолверов данных и конфигураций маршрутов.
/// </summary>
public class NotificationRoutesContext(IServiceProvider serviceProvider)
{
    
    private Dictionary<string, INotificationDataResolver> _notificationDataResolvers = new();
    private Dictionary<string, INotificationRouteConfiguration> _notificationRoutes = new();
    
    /// <summary>
    /// Добавляет резолвер данных для уведомления в реестр.
    /// </summary>
    /// <param name="notificationDataResolver">Резолвер данных уведомления</param>
    /// <returns>Текущий экземпляр контекста для цепочки вызовов</returns>
    public NotificationRoutesContext AddNotificationDataResolver(INotificationDataResolver notificationDataResolver)
    {
        _notificationDataResolvers.Add(notificationDataResolver.Route, notificationDataResolver);
        return this;
    }
    
    /// <summary>
    /// Добавляет конфигурацию маршрута уведомления в реестр.
    /// </summary>
    /// <param name="notificationRouteConfiguration">Конфигурация маршрута</param>
    /// <returns>Текущий экземпляр контекста для цепочки вызовов</returns>
    public NotificationRoutesContext AddNotificationRouteConfig(INotificationRouteConfiguration notificationRouteConfiguration)
    {
        _notificationRoutes.Add(notificationRouteConfiguration.Name, notificationRouteConfiguration);
        return this;
    }


    /// <summary>
    /// Добавляет обработчик уведомления по его типу из DI контейнера.
    /// </summary>
    /// <param name="impType">Тип обработчика (INotificationDataResolver или INotificationRouteConfiguration)</param>
    /// <returns>Текущий экземпляр контекста для цепочки вызовов</returns>
    /// <exception cref="Exception">Выбрасывается, если тип не может быть разрешен из DI</exception>
    public NotificationRoutesContext AddFromType(Type impType)
    {
        var serviceObj = serviceProvider.GetRequiredService(impType);

        return serviceObj switch
        {
            INotificationDataResolver notificationDataResolver => AddNotificationDataResolver(notificationDataResolver),
            INotificationRouteConfiguration notificationRouteConfiguration => AddNotificationRouteConfig(
                notificationRouteConfiguration),
            _ => throw new Exception($"Cannot resolve service {impType.FullName} from DI")
        };
    }

    /// <summary>
    /// Автоматически регистрирует все обработчики уведомлений из указанной сборки.
    /// Находит все типы, реализующие INotificationDataResolver и INotificationRouteConfiguration.
    /// </summary>
    /// <param name="assembly">Сборка для сканирования</param>
    /// <returns>Текущий экземпляр контекста для цепочки вызовов</returns>
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

    /// <summary>
    /// Получает резолвер данных для указанного маршрута.
    /// </summary>
    /// <param name="route">Имя маршрута</param>
    /// <returns>Резолвер данных для маршрута</returns>
    /// <exception cref="KeyNotFoundException">Выбрасывается, если маршрут не зарегистрирован</exception>
    public INotificationDataResolver GetDataResolverForRoute(string route)
    {
        var resolver = _notificationDataResolvers[route];
        
        if (resolver == null) 
            throw new KeyNotFoundException("No notification resolver found for route: " + route);
        return resolver;
    }

    /// <summary>
    /// Получает конфигурацию для указанного маршрута.
    /// </summary>
    /// <param name="route">Имя маршрута</param>
    /// <returns>Конфигурация маршрута</returns>
    /// <exception cref="KeyNotFoundException">Выбрасывается, если маршрут не зарегистрирован</exception>
    public INotificationRouteConfiguration GetNotificationRouteConfiguration(string route)
    {
        var routeConfig = _notificationRoutes[route];
        if (routeConfig == null) 
            throw new KeyNotFoundException("No notification route config found for route: " + route);
        return routeConfig;
    }
    
    /// <summary>
    /// Получает все зарегистрированные конфигурации маршрутов.
    /// </summary>
    /// <returns>Коллекция всех конфигураций маршрутов</returns>
    public IEnumerable<INotificationRouteConfiguration> GetAllNotificationRouteConfigurations()
    {
        return _notificationRoutes.Values;
    }
}
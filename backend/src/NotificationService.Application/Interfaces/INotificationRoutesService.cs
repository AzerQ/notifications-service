using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Interfaces;

public interface INotificationRoutesService : IDisposable
{
    INotificationRoute GetNotificationRouteByName(string routeName);

    IEnumerable<NotificationRouteConfiguration> GetAllNotificationRoutesConfigurations();

}
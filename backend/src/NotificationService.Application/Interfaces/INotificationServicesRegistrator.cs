using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace NotificationService.Application.Interfaces
{
    /// <summary>Регистрация сервисов для уведомлений</summary>
    public interface INotificationServicesRegistrator
    {
        IServiceCollection RegisterServices(IServiceCollection serviceCollection, IConfiguration configuration);
    }

}

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace NotificationService.Application.Interfaces
{
    /// <summary>Регистрация сервисов для уведомлений</summary>
    public interface INotificationServicesRegister
    {
        IServiceCollection RegisterServices(IServiceCollection serviceCollection, ConfigurationManager configurationManager);
    }

}

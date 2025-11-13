using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Interfaces;

namespace NotificationService.TestHandlers;

/// <summary>
/// Регистратор тестовых сервисов уведомлений
/// </summary>
public class NotificationServicesRegister : INotificationServicesRegister
{
    /// <summary>
    /// Регистрирует сервисы уведомлений в контейнере зависимостей
    /// </summary>
    public IServiceCollection RegisterServices(IServiceCollection serviceCollection, IConfiguration configuration) =>
        serviceCollection;

}

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.Interfaces;

namespace NotificationService.TestHandlers;


public class NotificationServicesRegistrator : INotificationServicesRegistrator
{
    public IServiceCollection RegisterServices(IServiceCollection serviceCollection, IConfiguration configuration) =>
        serviceCollection;

}

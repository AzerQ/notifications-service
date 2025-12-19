using Microsoft.Extensions.DependencyInjection;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Domain.Models.InApp;

namespace NotificationService.Application.Services;

/// <summary>
/// Сервис для выполнения команд создания и отправки уведомлений.
/// Координирует весь процесс от получения запроса до отправки уведомления.
/// </summary>
public class NotificationCommandService 
    (IServiceProvider serviceProvider,
    INotificationRepository notificationRepository,
    ITemplateRepository templateRepository,
    INotificationSender notificationSender,
    INotificationMapper notificationMapper) : INotificationCommandService
{
    
    /// <summary>
    /// Обрабатывает запрос на создание и отправку уведомления.
    /// Выполняет определение данных, создание уведомления, сохранение в БД и отправку по каналам.
    /// </summary>
    /// <param name="request">Запрос на создание уведомления</param>
    /// <returns>DTO ответа с информацией о созданном уведомлении</returns>
    /// <exception cref="ArgumentNullException">Выбрасывается, если запрос null</exception>
    /// <exception cref="ArgumentException">Выбрасывается, если шаблон не найден</exception>
    public async Task<NotificationResponseDto> ProcessNotificationRequestAsync(NotificationRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        
        INotificationRoute notificationRoute = 
            serviceProvider.GetKeyedService<INotificationRoute>(request.Route) ?? throw new KeyNotFoundException($"Route ${request.Route} handler not found");
        
        NotificationRouteConfiguration notificationRouteConfiguration = notificationRoute.RouteConfiguration ?? throw new ArgumentException($"Route '{request.Route}' configuration not found.");
        
        NotificationTemplate template = templateRepository.GetTemplateByName(notificationRouteConfiguration.TemplateName)
                       ?? throw new ArgumentException($"Template '{notificationRouteConfiguration.TemplateName}' not found.");
        
        
        var preparedNotifications = (await notificationMapper.MapFromRequest(request, notificationRoute, template))
            .ToArray();

            notificationRepository.SaveNotifications(preparedNotifications);
            
            notificationRepository.SaveChanges();

            await Task.WhenAll(preparedNotifications.Select(notification =>
                notificationSender.SendAsync(notification, notificationRouteConfiguration)));
            
            notificationRepository.SaveChanges();

            return notificationMapper.MapToResponse(preparedNotifications);
        
    }

    public Task MarkAllUserNotificationsAsRead(Guid userId)
    {
       notificationRepository.MarkAllUserNotificationsAsRead(userId);
       notificationRepository.SaveChanges();
       return Task.CompletedTask;
    }
}

/// <summary>
/// Сервис для выполнения запросов на чтение уведомлений.
/// Предоставляет методы для получения уведомлений по различным критериям.
/// </summary>
public class NotificationQueryService(
    INotificationRepository notificationRepository,
    INotificationMapper notificationMapper,
    InAppNotificationMapper inAppNotificationMapper,
    INotificationRoutesService notificationRoutesService
) : INotificationQueryService
{
    /// <summary>
    /// Получает уведомление по его идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор уведомления</param>
    /// <returns>DTO уведомления или null, если не найдено</returns>
    public async Task<NotificationResponseDto?> GetByIdAsync(Guid id)
    {
        var notification = await notificationRepository.GetNotificationByIdAsync(id);
        return notification is null ? null : notificationMapper.MapToResponse([notification]);
    }

    private List<Notification> GetOnlyInAppSentNotifications(IEnumerable<Notification> notifications)
    {
        return notifications
            .Where(n => n.DeliveryChannelsState.Any(c => c is { NotificationChannel: NotificationChannel.InApp, DeliveryStatus: NotificationDeliveryStatus.Sent }))
            .ToList();
    }

    /// <summary>
    /// Получает все уведомления для указанного пользователя.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="userNotificationsRequest">Запрос пользователя на уведомления</param>
    /// <returns>Коллекция DTO уведомлений пользователя</returns>
    public async Task<IReadOnlyCollection<AppNotification>> GetUserNotifications(Guid userId,
        GetUserNotificationsRequest userNotificationsRequest)
    {
        var notifications = GetOnlyInAppSentNotifications(await notificationRepository.GetUserNotificationsAsync(userId, userNotificationsRequest));

        var allNotificationRoutes = notificationRoutesService.GetAllNotificationRoutesConfigurations();       
        
        var distinctRoutesConfigurations = notifications
                            .Select(n => n.Route)
                            .Distinct()
                            .Select(route => allNotificationRoutes.FirstOrDefault(r => r.Name == route))
                            .Where(route => route is not null)
                            .ToDictionary(route => route!.Name, v => v!);

        return [.. notifications.Select(n => inAppNotificationMapper.Map(n, distinctRoutesConfigurations[n.Route]))];

    }
}

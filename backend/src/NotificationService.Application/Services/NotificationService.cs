using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services;

/// <summary>
/// Сервис для выполнения команд создания и отправки уведомлений.
/// Координирует весь процесс от получения запроса до отправки уведомления.
/// </summary>
public class NotificationCommandService 
    (NotificationRoutesContext notificationRoutesContext,
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
        
        INotificationDataResolver notificationDataResolver = notificationRoutesContext.GetDataResolverForRoute(request.Route);
        
        INotificationRouteConfiguration notificationRouteConfiguration = notificationRoutesContext.GetNotificationRouteConfiguration(request.Route);
        
        NotificationTemplate template = await templateRepository.GetTemplateByNameAsync(notificationRouteConfiguration.TemplateName)
                       ?? throw new ArgumentException($"Template '{notificationRouteConfiguration.TemplateName}' not found.");
        
        
        var preparedNotifications = (await notificationMapper.MapFromRequest(request, notificationDataResolver, template))
            .ToArray();

        await notificationRepository.SaveNotificationsAsync(preparedNotifications);
        
        await Task.WhenAll(preparedNotifications.Select(notificationSender.SendAsync).ToArray());
        
        return notificationMapper.MapToResponse(preparedNotifications);
        
    }
}

/// <summary>
/// Сервис для выполнения запросов на чтение уведомлений.
/// Предоставляет методы для получения уведомлений по различным критериям.
/// </summary>
public class NotificationQueryService : INotificationQueryService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationMapper _notificationMapper;

    public NotificationQueryService(
        INotificationRepository notificationRepository,
        INotificationMapper notificationMapper)
    {
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _notificationMapper = notificationMapper;
    }

    /// <summary>
    /// Получает уведомление по его идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор уведомления</param>
    /// <returns>DTO уведомления или null, если не найдено</returns>
    public async Task<NotificationResponseDto?> GetByIdAsync(Guid id)
    {
        var notification = await _notificationRepository.GetNotificationByIdAsync(id);
        return notification is null ? null : _notificationMapper.MapToResponse([notification]);
    }

    /// <summary>
    /// Получает все уведомления для указанного пользователя.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <returns>Коллекция DTO уведомлений пользователя</returns>
    public async Task<IReadOnlyCollection<NotificationResponseDto>> GetByUserAsync(Guid userId)
    {
        var notifications = await _notificationRepository.GetNotificationsForUserAsync(userId);
        return notifications.Select(n => _notificationMapper.MapToResponse([n])).ToArray();
    }

    /// <summary>
    /// Получает уведомления по статусу доставки.
    /// </summary>
    /// <param name="status">Статус доставки (строка)</param>
    /// <returns>Коллекция DTO уведомлений с указанным статусом</returns>
    /// <exception cref="ArgumentException">Выбрасывается, если статус неизвестен</exception>
    public async Task<IReadOnlyCollection<NotificationResponseDto>> GetByStatusAsync(string status)
    {
        if (!Enum.TryParse<NotificationDeliveryStatus>(status, true, out var parsedStatus))
        {
            throw new ArgumentException($"Unknown notification status '{status}'.", nameof(status));
        }

        var notifications = await _notificationRepository.GetNotificationsByStatusAsync(parsedStatus);
        return notifications.Select(n =>_notificationMapper.MapToResponse([n])).ToArray();
    }
}

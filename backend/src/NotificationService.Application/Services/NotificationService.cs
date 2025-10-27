using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services;

public class NotificationCommandService 
    (NotificationRoutesContext notificationRoutesContext,
    INotificationRepository notificationRepository,
    ITemplateRepository templateRepository,
    INotificationSender notificationSender,
    INotificationMapper notificationMapper) : INotificationCommandService
{
    
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

    public async Task<NotificationResponseDto?> GetByIdAsync(Guid id)
    {
        var notification = await _notificationRepository.GetNotificationByIdAsync(id);
        return notification is null ? null : _notificationMapper.MapToResponse([notification]);
    }

    public async Task<IReadOnlyCollection<NotificationResponseDto>> GetByUserAsync(Guid userId)
    {
        var notifications = await _notificationRepository.GetNotificationsForUserAsync(userId);
        return notifications.Select(n => _notificationMapper.MapToResponse([n])).ToArray();
    }

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

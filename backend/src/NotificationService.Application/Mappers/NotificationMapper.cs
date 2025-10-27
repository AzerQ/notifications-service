using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Mappers;

public class NotificationMapper(ITemplateRenderer templateRenderer) : INotificationMapper
{
    public NotificationResponseDto MapToResponse(IEnumerable<Notification> notifications)
    {
        var notificationsList = notifications.ToList();
        var notification = notificationsList.FirstOrDefault();
        var recipients = notificationsList.Select(n => n.Recipient);
        
        ArgumentNullException.ThrowIfNull(notification);

        return new NotificationResponseDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Route = notification.Route,
            CreatedAt = notification.CreatedAt,
            Recipients = recipients.Select(MapToUserDto),
            CreatedNotificationIds = notificationsList.Select(n => n.Id)
        };
    }

    public async Task<IEnumerable<Notification>> MapFromRequest(NotificationRequest request, INotificationDataResolver notificationDataResolver, NotificationTemplate template)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(template);
        ArgumentNullException.ThrowIfNull(notificationDataResolver);

        var notificationData = await notificationDataResolver.ResolveNotificationFullData(request);
        
        var renderedContent = templateRenderer.Render(template.Content, notificationData);
        var renderedSubject = string.IsNullOrWhiteSpace(template.Subject)
            ? request.Title ?? "Тема отсутсвует"
            : templateRenderer.Render(template.Subject, notificationData);
        
        var notification = new Notification
        {
            Title = renderedSubject,
            Message = renderedContent,
            Route = request.Route,
            Template = template,
            CreatedAt = DateTime.UtcNow
        };

        if (request.Channels is not null 
            && request.Channels.Length != 0)
        {
            notification.DeliveryChannelsState = Notification.ChannelsDefaultState(request.Channels);
        }
        
        var recipients = await notificationDataResolver.ResolveNotificationRecipients(request);
        return recipients.Select(recipient => notification with { Id = Guid.NewGuid(), Recipient = recipient });

    }

    public UserDto MapToUserDto(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };
    }
}

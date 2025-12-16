using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Mappers;

/// <summary>
/// Маппер для преобразования между доменными моделями уведомлений и DTO.
/// Отвечает за конвертацию запросов в доменные модели и формирование ответов API.
/// </summary>
public class NotificationMapper(ITemplateRenderer templateRenderer) : INotificationMapper
{
    /// <summary>
    /// Преобразует коллекцию доменных уведомлений в DTO ответа для API.
    /// </summary>
    /// <param name="notifications">Коллекция доменных уведомлений</param>
    /// <returns>DTO ответа с информацией об уведомлениях</returns>
    public NotificationResponseDto MapToResponse(IEnumerable<Notification> notifications)
    {
        var notificationsList = notifications.ToList();
        var firstNotification = notificationsList.FirstOrDefault();
        var recipients = notificationsList.Select(n => n.Recipient).ToList();
        string statusMessage = recipients.Count < 0 ?
         "Notification not sended (Not found recipients)"
         : "Notification sended successfully";

        return new NotificationResponseDto
        {
            Title = firstNotification?.Title,
            Route = firstNotification?.Route ?? "",
            CreatedAt = firstNotification?.CreatedAt ?? DateTime.MinValue,
            Recipients = recipients.Select(MapToUserDto),
            CreatedNotificationIds = notificationsList.Select(n => n.Id),
            StatusMessage = statusMessage
        };
    }

    /// <summary>
    /// Создает коллекцию доменных уведомлений из входящего запроса API.
    /// Выполняет резолвинг данных, рендеринг шаблонов и создание уведомлений для каждого получателя.
    /// </summary>
    /// <param name="request">Запрос на создание уведомления</param>
    /// <param name="notificationDataResolver">Резолвер данных для маршрута</param>
    /// <param name="template">Шаблон для форматирования</param>
    /// <returns>Коллекция созданных доменных уведомлений</returns>
    /// <exception cref="ArgumentNullException">Выбрасывается, если какой-либо параметр null</exception>
    public async Task<IEnumerable<Notification>> MapFromRequest(NotificationRequest request, INotificationDataResolver notificationDataResolver, NotificationTemplate template)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(template);
        ArgumentNullException.ThrowIfNull(notificationDataResolver);

        var notificationData = await notificationDataResolver.ResolveNotificationFullData(request);
        
        var renderedContent = templateRenderer.Render(template.CommonContentTemplate, notificationData);
        var renderedSubject = string.IsNullOrWhiteSpace(template.Subject)
            ? request.Title ?? "Тема отсутсвует"
            : templateRenderer.Render(template.Subject, notificationData.Data);
        
        var notification = new Notification
        {
            Title = renderedSubject,
            Message = renderedContent,
            Route = request.Route,
            TemplateName = template.Name,
            CreatedAt = DateTime.UtcNow,
            TemplateData = notificationData.Data,
            Url = notificationData.Url
        };

        if (request.Channels is not null 
            && request.Channels.Length != 0)
        {
            notification.DeliveryChannelsState = Notification.ChannelsDefaultState(request.Channels);
        }
        
        var recipients = await notificationDataResolver.ResolveNotificationRecipients(request);
        return recipients.Select(recipient => notification with { Id = Guid.NewGuid(), Recipient = recipient });

    }

    /// <summary>
    /// Преобразует доменную модель пользователя в DTO.
    /// </summary>
    /// <param name="user">Доменная модель пользователя</param>
    /// <returns>DTO пользователя</returns>
    /// <exception cref="ArgumentNullException">Выбрасывается, если пользователь null</exception>
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

using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services;

/// <summary>
/// Сервис оркестрации отправки уведомлений по различным каналам доставки.
/// Управляет процессом валидации, проверки предпочтений и отправки по всем активным каналам.
/// </summary>
public class NotificationSender(
    INotificationRepository notificationRepository,
    ITemplateRenderer templateRenderer,
    IEmailProvider emailProvider,
    IUserRoutePreferenceRepository userRoutePreferenceRepository,
    IInAppNotificationSender inAppNotificationSender,
    InAppNotificationMapper inAppNotificationMapper) : INotificationSender
{

    /// <summary>
    /// Отправляет уведомление по всем активным каналам доставки.
    /// Выполняет валидацию, проверку пользовательских предпочтений и последовательную отправку по каналам.
    /// </summary>
    /// <param name="notification">Уведомление для отправки</param>
    /// <exception cref="ArgumentNullException">Выбрасывается, если уведомление или получатель null</exception>
    /// <exception cref="ArgumentException">Выбрасывается, если уведомление не прошло валидацию</exception>
    public async Task SendAsync(Notification notification, INotificationRouteConfiguration routeConfiguration)
    {
        ArgumentNullException.ThrowIfNull(notification);
        ArgumentNullException.ThrowIfNull(notification.Recipient);

        var validationResult = NotificationValidator.Validate(notification);
        if (!validationResult.IsValid)
        {
            throw new ArgumentException(string.Join("; ", validationResult.Errors));
        }

        // Проверка пользовательских предпочтений по маршрутам (по умолчанию разрешено)
        if (userRoutePreferenceRepository is not null && notification.Recipient is not null)
        {
            var allowed = await userRoutePreferenceRepository.IsRouteEnabledAsync(notification.Recipient.Id, notification.Route);
            if (!allowed)
            {
                foreach (var channelState in notification.DeliveryChannelsState)
                    channelState.DeliveryStatus = NotificationDeliveryStatus.Skipped;

                await notificationRepository.UpdateNotificationsAsync(notification);
                return; // тихо выходим без отправки
            }
        }

        var channelsSendTasks = notification.DeliveryChannelsState.Select(channel => 
        SendToChannelAsync(notification, channel.NotificationChannel, ResolveContent(notification, channel.NotificationChannel), routeConfiguration));

        await Task.WhenAll(channelsSendTasks);

        await notificationRepository.UpdateNotificationsAsync(notification);

    }

    /// <summary>
    /// Отправляет уведомление по указанному каналу доставки.
    /// </summary>
    /// <param name="notification">Уведомление для отправки</param>
    /// <param name="channel">Канал доставки</param>
    /// <exception cref="NotSupportedException">Выбрасывается, если канал не поддерживается</exception>
    private async Task SendToChannelAsync(Notification notification, NotificationChannel channel, string content, 
    INotificationRouteConfiguration routeConfiguration)
    {
        var wasSent = channel switch
        {
            NotificationChannel.Email => await SendEmailAsync(notification, content),
            NotificationChannel.InApp => await SendInAppAsync(notification, content, routeConfiguration),
            _ => throw new NotSupportedException($"Канал {channel} не поддерживается.")
        };

       notification.DeliveryChannelsState
            .FirstOrDefault(c => c.NotificationChannel == channel)!
            .DeliveryStatus = wasSent ? NotificationDeliveryStatus.Sent : NotificationDeliveryStatus.Failed;
    }

    private async Task<bool> SendInAppAsync(Notification notification, string content, INotificationRouteConfiguration routeConfiguration)
    {
        var inAppNotification = inAppNotificationMapper.Map(notification, routeConfiguration);
        inAppNotification.Content = content;
        await inAppNotificationSender.SendToUsersAsync(inAppNotification);
        return true;
    }

    /// <summary>
    /// Отправляет уведомление через Email (SMTP).
    /// </summary>
    /// <param name="notification">Уведомление для отправки</param>
    /// <returns>true если отправка успешна, иначе false</returns>
    private async Task<bool> SendEmailAsync(Notification notification, string content)
    {
        if (string.IsNullOrWhiteSpace(notification.Recipient.Email))
        {
            return false;
        }

        var subject = notification.Title;

        return await emailProvider.SendEmailAsync(notification.Recipient.Email, subject, content);
    }

    /// <summary>
    /// Извлекает содержимое уведомления для отправки.
    /// Приоритет: Message уведомления, затем Content шаблона.
    /// </summary>
    /// <param name="notification">Уведомление</param>
    /// <returns>Содержимое для отправки</returns>
    private string ResolveContent(Notification notification, NotificationChannel notificationChannel)
    {
        string contentTemplate = notification.Template.ContentTemplateByChannel(notificationChannel);
        return templateRenderer.Render(contentTemplate, notification.TemplateData);
    }
}

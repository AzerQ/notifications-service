using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Services;

public class NotificationSender : INotificationSender
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IEmailProvider? _emailProvider;
    private readonly ISmsProvider? _smsProvider;
    private readonly IPushNotificationProvider? _pushNotificationProvider;
    private readonly IUserRoutePreferenceRepository? _userRoutePreferenceRepository;

    public NotificationSender(
        INotificationRepository notificationRepository,
        IEmailProvider? emailProvider = null,
        ISmsProvider? smsProvider = null,
        IPushNotificationProvider? pushNotificationProvider = null,
        IUserRoutePreferenceRepository? userRoutePreferenceRepository = null)
    {
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _emailProvider = emailProvider;
        _smsProvider = smsProvider;
        _pushNotificationProvider = pushNotificationProvider;
        _userRoutePreferenceRepository = userRoutePreferenceRepository;
    }

    public async Task SendAsync(Notification? notification)
    {
        ArgumentNullException.ThrowIfNull(notification);
        ArgumentNullException.ThrowIfNull(notification.Recipient);

        var validationResult = NotificationValidator.Validate(notification);
        if (!validationResult.IsValid)
        {
            throw new ArgumentException(string.Join("; ", validationResult.Errors));
        }

        // Проверка пользовательских предпочтений по маршрутам (по умолчанию разрешено)
        if (_userRoutePreferenceRepository is not null && notification.Recipient is not null)
        {
            var allowed = await _userRoutePreferenceRepository.IsRouteEnabledAsync(notification.Recipient.Id, notification.Route);
            if (!allowed)
            {
                foreach (var channelState in notification.DeliveryChannelsState)
                    channelState.DeliveryStatus = NotificationDeliveryStatus.Skipped;

                await _notificationRepository.UpdateNotificationsAsync(notification);
                return; // тихо выходим без отправки
            }
        }

        var channelsSendTasks = notification.DeliveryChannelsState.Select(channel => SendToChannelAsync(notification, channel.NotificationChannel));

        await Task.WhenAll(channelsSendTasks);

        await _notificationRepository.UpdateNotificationsAsync(notification);

    }

    private async Task SendToChannelAsync(Notification notification, NotificationChannel channel)
    {
        var wasSent = channel switch
        {
            NotificationChannel.Email => await SendEmailAsync(notification),
            NotificationChannel.Sms => await SendSmsAsync(notification),
            NotificationChannel.Push => await SendPushAsync(notification),
            _ => throw new NotSupportedException($"Канал {channel} не поддерживается.")
        };

       notification.DeliveryChannelsState
            .FirstOrDefault(c => c.NotificationChannel == channel)!
            .DeliveryStatus = wasSent ? NotificationDeliveryStatus.Sent : NotificationDeliveryStatus.Failed;
    }

    private async Task<bool> SendEmailAsync(Notification notification)
    {
        if (_emailProvider is null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(notification.Recipient.Email))
        {
            return false;
        }

        var subject = notification.Template?.Subject ?? notification.Title;
        var body = ResolveContent(notification);

        return await _emailProvider.SendEmailAsync(notification.Recipient.Email, subject, body);
    }

    private async Task<bool> SendSmsAsync(Notification notification)
    {
        if (_smsProvider is null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(notification.Recipient.PhoneNumber))
        {
            return false;
        }

        var message = ResolveContent(notification);
        return await _smsProvider.SendSmsAsync(notification.Recipient.PhoneNumber, message);
    }

    private async Task<bool> SendPushAsync(Notification notification)
    {
        if (_pushNotificationProvider is null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(notification.Recipient.DeviceToken))
        {
            return false;
        }

        var body = ResolveContent(notification);
        var title = notification.Template?.Subject ?? notification.Title;

        return await _pushNotificationProvider.SendPushNotificationAsync(notification.Recipient.DeviceToken!, title, body);
    }

    private static string ResolveContent(Notification notification)
    {
        if (!string.IsNullOrWhiteSpace(notification.Message))
        {
            return notification.Message;
        }

        return notification.Template?.Content ?? string.Empty;
    }
}

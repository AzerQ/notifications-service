using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface IEmailProvider
{
    Task<bool> SendEmailAsync(string to, string subject, string body, string? fromName = null);
}

public interface ISmsProvider
{
    Task<bool> SendSmsAsync(string phoneNumber, string message);
}

public interface IPushNotificationProvider
{
    Task<bool> SendPushNotificationAsync(string deviceToken, string title, string message);
}
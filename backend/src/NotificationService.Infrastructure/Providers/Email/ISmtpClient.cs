using System.Net.Mail;

namespace NotificationService.Infrastructure.Providers.Email;

public interface ISmtpClient : IDisposable
{
    Task SendMailAsync(MailMessage message);
}

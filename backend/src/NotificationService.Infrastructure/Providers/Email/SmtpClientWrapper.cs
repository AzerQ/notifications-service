using System.Net.Mail;

namespace NotificationService.Infrastructure.Providers.Email;

public class SmtpClientWrapper : ISmtpClient
{
    private readonly SmtpClient _smtpClient;

    public SmtpClientWrapper(SmtpClient smtpClient)
    {
        _smtpClient = smtpClient ?? throw new ArgumentNullException(nameof(smtpClient));
    }

    public Task SendMailAsync(MailMessage message)
    {
        return _smtpClient.SendMailAsync(message);
    }

    public void Dispose()
    {
        _smtpClient.Dispose();
    }
}

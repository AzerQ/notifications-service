namespace NotificationService.Infrastructure.Providers.Email;

public interface ISmtpClientFactory
{
    ISmtpClient Create(EmailProviderOptions options);
}

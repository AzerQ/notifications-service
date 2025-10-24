using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Infrastructure.Providers.Email;

public class SmtpEmailProvider : IEmailProvider
{
    private readonly EmailProviderOptions _options;
    private readonly ILogger<SmtpEmailProvider> _logger;
    private readonly ISmtpClientFactory _smtpClientFactory;

    public SmtpEmailProvider(
        IOptions<EmailProviderOptions> options,
        ILogger<SmtpEmailProvider> logger,
        ISmtpClientFactory smtpClientFactory)
    {
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _smtpClientFactory = smtpClientFactory ?? throw new ArgumentNullException(nameof(smtpClientFactory));
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, string? fromName = null)
    {
        if (string.IsNullOrWhiteSpace(to))
        {
            throw new ArgumentException("Recipient email is required.", nameof(to));
        }

        using var smtpClient = _smtpClientFactory.Create(_options);

        var fromAddress = new MailAddress(
            string.IsNullOrWhiteSpace(_options.FromAddress) ? _options.UserName : _options.FromAddress,
            fromName ?? _options.FromName ?? _options.UserName);
        var toAddress = new MailAddress(to);

        using var message = new MailMessage(fromAddress, toAddress)
        {
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        try
        {
            await smtpClient.SendMailAsync(message);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient} via SMTP host {Host}", to, _options.SmtpHost);
            return false;
        }
    }
}

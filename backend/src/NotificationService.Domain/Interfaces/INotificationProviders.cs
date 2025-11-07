using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface IEmailProvider
{
    Task<bool> SendEmailAsync(string to, string subject, string body, string? fromName = null);
}
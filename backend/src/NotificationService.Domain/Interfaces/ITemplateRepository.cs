using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface ITemplateRepository
{
    Task<bool> IsTemplateExistsAsync(string name);
    Task<NotificationTemplate?> GetTemplateByNameAsync(string name);
    Task<NotificationTemplate> CreateTemplateAsync(NotificationTemplate template);
    Task UpdateTemplateAsync(NotificationTemplate template);
}
using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface ITemplateRepository
{
    bool IsTemplateExists(string name);
    NotificationTemplate? GetTemplateByName(string name);
    void CreateTemplate(NotificationTemplate template);
    void UpdateTemplate(NotificationTemplate template);
}
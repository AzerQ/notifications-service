using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

/// <summary>
/// Сервис для получения данных по уведомлению
/// </summary>
public interface INotificationDataResolver
{
    /// <summary>
    /// Маршрут уведомления для которого может применятся данный сервис
    /// </summary>
    public string Route { get; }
    
    /// <summary>
    /// Наименование шаблона
    /// </summary>
    public string TemplateName { get; }
    
    /// <summary>
    /// Определить получателей уведомления
    /// </summary>
    /// <param name="notificationRequest">Запрос на форирование уведомления</param>
    /// <returns>Список получателей уведомления</returns>
    Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest);
    
    /// <summary>
    /// Определить данные шаблона уведомления
    /// </summary>
    /// <param name="notificationRequest">Запрос на форирование уведомления</param>
    /// <returns>Данные шаблона</returns>
    Task<object> ResolveNotificationTemplateData(NotificationRequest notificationRequest);
}
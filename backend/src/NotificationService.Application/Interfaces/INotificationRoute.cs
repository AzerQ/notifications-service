using NotificationService.Application.DTOs;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Application.Interfaces;

[AttributeUsage(AttributeTargets.Class)]
public class NotificationRouteAttribute : Attribute
{
    public NotificationRouteAttribute()
    {
        
    }
    
    public NotificationRouteAttribute(string name)
    {
        Name = name;
    }

    public required string Name { get; set; }
}

/// <summary>
/// Сервис для получения данных по уведомлению
/// </summary>
public interface INotificationRoute
{
    
    /// <summary>
    /// Конфигурация маршрута
    /// </summary>
    public NotificationRouteConfiguration RouteConfiguration { get; } 
    
    /// <summary>
    /// Определить получателей уведомления
    /// </summary>
    /// <param name="notificationRequest">Запрос на форирование уведомления</param>
    /// <returns>Список получателей уведомления</returns>
    Task<IEnumerable<Guid>> ResolveNotificationRecipientsIds(NotificationRequest notificationRequest);
    
    /// <summary>
    /// Определить полные данные уведомления (Которые затем будут использованны в шаблонах)
    /// </summary>
    /// <param name="notificationRequest">Запрос на форирование уведомления</param>
    /// <returns>Полные данные по уведомлению</returns>
    Task<NotificationFullData> ResolveNotificationFullData(NotificationRequest notificationRequest);
}

public record NotificationFullData (object Data, string Url);
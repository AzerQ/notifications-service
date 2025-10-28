using NotificationService.Application.DTOs;
using NotificationService.Domain.Models;

namespace NotificationService.Application.Interfaces;

/// <summary>
/// Сервис для получения данных по уведомлению
/// </summary>
public interface INotificationDataResolver
{
    /// <summary>
    /// Наименование маршрута
    /// </summary>
    public string Route { get; }
    
    /// <summary>
    /// Определить получателей уведомления
    /// </summary>
    /// <param name="notificationRequest">Запрос на форирование уведомления</param>
    /// <returns>Список получателей уведомления</returns>
    Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest);
    
    /// <summary>
    /// Определить полные данные уведомления (Которые затем будут использованны в шаблонах)
    /// </summary>
    /// <param name="notificationRequest">Запрос на форирование уведомления</param>
    /// <returns>Полные данные по уведомлению</returns>
    Task<object> ResolveNotificationFullData(NotificationRequest notificationRequest);
}
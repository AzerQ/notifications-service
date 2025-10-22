namespace NotificationService.Domain.Interfaces;

/// <summary>
/// Маршрут для уведомления
/// </summary>
public interface INotificationRouteConfiguration
{
    /// <summary>
    /// Наименование маршрута
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// Тип объекта по которому приходят уведомления
    /// </summary>
    public NotificationObjectKind NotificationObjectKind { get; }
    
    /// <summary>
    /// Наименование шаблона
    /// </summary>
    public string TemplateName { get; }
    
    /// <summary>
    /// Отображаемое имя маршрута
    /// </summary>
    public string DisplayName { get; }
    
    /// <summary>
    /// Описание маршрута
    /// </summary>
    public string Description { get; }

    /// <summary>
    /// Дополнительные теги для маршрута
    /// </summary>
    public IEnumerable<string> Tags { get; }
    
    /// <summary>
    /// Тип  полезной нагрузки
    /// </summary>
    public Type PayloadType { get; }
    
}

/// <summary>
/// Тип объекта по которому приходит оповещение
/// </summary>
/// <param name="Name">Наименование (Идентификатор)</param>
/// <param name="DisplayName">Локализованное название</param>
public record NotificationObjectKind(string Name, string DisplayName);
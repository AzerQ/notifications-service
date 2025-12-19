namespace NotificationService.Domain.Interfaces;

/// <summary>
/// Маршрут для уведомления
/// </summary>
public class NotificationRouteConfiguration
{
    /// <summary>
    /// Наименование маршрута
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Тип объекта по которому приходят уведомления
    /// </summary>
    public required NotificationObjectKind NotificationObjectKind { get; set; }
    
    /// <summary>
    /// Наименование шаблона
    /// </summary>
    public required string TemplateName { get; set; }
    
    /// <summary>
    /// Отображаемое имя маршрута
    /// </summary>
    public required string DisplayName { get; set; }
    
    /// <summary>
    /// Описание маршрута
    /// </summary>
    public required string Description { get; set; }

    /// <summary>
    /// Дополнительные теги для маршрута
    /// </summary>
    public IEnumerable<string> Tags { get; set; } = [];
    
    /// <summary>
    /// Тип  полезной нагрузки
    /// </summary>
    public required Type PayloadType { get; set; }

    public Icon? Icon {get; set; }
    
}


/// <summary>
/// Lucide icon refrence
/// </summary>
public record Icon (string Name, string? CssClass = null);

/// <summary>
/// Тип объекта по которому приходит оповещение
/// </summary>
/// <param name="Name">Наименование (Идентификатор)</param>
/// <param name="DisplayName">Локализованное название</param>
public record NotificationObjectKind(string Name, string DisplayName);
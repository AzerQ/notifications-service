using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers;

/// <summary>
/// Тестовые типы объектов уведомлений
/// </summary>
public static class NotificationObjectKinds
{
    public static readonly NotificationObjectKind User = new("Пользователь", "Пользователь");
    public static readonly NotificationObjectKind Order = new("Заказ", "Заказ");
    public static readonly NotificationObjectKind Task = new("Задача", "Задача");
}

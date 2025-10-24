using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers;

/// <summary>
/// Test notification object kinds
/// </summary>
public static class NotificationObjectKinds
{
    public static readonly NotificationObjectKind User = new("User", "User");
    public static readonly NotificationObjectKind Order = new("Order", "Order");
    public static readonly NotificationObjectKind Task = new("Task", "Task");
}

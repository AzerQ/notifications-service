using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.TaskAssigned;

public class TaskAssignedRouteConfig : INotificationRouteConfiguration
{
    public string Name => "TaskAssigned";
    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.Task;
    public string TemplateName => "TaskAssigned";
    public string DisplayName => "Задача назначена";
    public string Description => "Уведомление отправляется при назначении задачи пользователю";
    public IEnumerable<string> Tags => new[] { "задача", "назначение", "работа" };
    public Type PayloadType => typeof(TaskAssignedRequestData);
    public Icon? Icon => new ("bookmark-check");
}

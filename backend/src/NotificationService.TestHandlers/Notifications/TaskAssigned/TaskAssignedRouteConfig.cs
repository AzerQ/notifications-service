using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.TaskAssigned;

public class TaskAssignedRouteConfig : INotificationRouteConfiguration
{
    public string Name => "TaskAssigned";
    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.Task;
    public string TemplateName => "TaskAssigned";
    public string DisplayName => "Task Assigned";
    public string Description => "Notification sent when a task is assigned to a user";
    public IEnumerable<string> Tags => new[] { "task", "assignment", "work" };
    public Type PayloadType => typeof(TaskAssignedRequestData);
    public Icon? Icon => new ("bookmark-check");
}

using NotificationService.Docsvision.Notifications.Common;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Docsvision.Notifications.TaskCompleted;

public class TaskCompletedRouteConfig : INotificationRouteConfiguration
{
    public const string TaskCompleted = nameof(TaskCompleted);

    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.Task;

    public string Name => TaskCompleted;

    public string TemplateName => TaskCompleted;

    public string DisplayName => "Завершено задание в СЭД Docsvision";

    public string Description => "Уведомление автору задания о завершении задания исполнителем";

    public IEnumerable<string> Tags => ["Задание", "Уведомление заместителю"];

    public Type PayloadType => typeof(TaskCommonNotificationRequestData);
}
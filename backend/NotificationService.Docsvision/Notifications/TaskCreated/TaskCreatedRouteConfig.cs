using NotificationService.Docsvision.Notifications.Common;
using NotificationService.Domain.Interfaces;

namespace NotificationService.Docsvision.Notifications.TaskCreated;

public class TaskCreatedRouteConfig : INotificationRouteConfiguration
{
    public const string TaskCreated = nameof(TaskCreated);

    public NotificationObjectKind NotificationObjectKind => NotificationObjectKinds.Task;

    public string Name => TaskCreated;

    public string TemplateName => TaskCreated;

    public string DisplayName => "Поступило новое задание для исполнителя в СЭД Docsvision";

    public string Description => "Уведомление о поступлении нового задание для исполнителя в СЭД Docsvision (При создании, делегировании, возврате с делегирования)";

    public IEnumerable<string> Tags => ["Задание", "Уведомление заместителю"];
    
    public Type PayloadType => typeof(TaskCommonNotificationRequestData);
}
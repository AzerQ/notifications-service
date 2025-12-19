using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;

namespace NotificationService.TestHandlers.Notifications.TaskAssigned;

[NotificationRoute(Name = Route)]
public class TaskAssignedNotificationRoute(IUserRepository userRepository) : INotificationRoute
{
    public const string Route = "TaskAssigned";

    public NotificationRouteConfiguration RouteConfiguration { get; } = new()
    {
        Name = Route,
        NotificationObjectKind = NotificationObjectKinds.Task,
        TemplateName = Route,
        DisplayName = "Задача назначена",
        Description = "Уведомление отправляется при назначении задачи пользователю",
        Tags = ["задача", "назначение", "работа"],
        PayloadType = typeof(TaskAssignedRequestData),
        Icon = new("bookmark-check")
    };

    public Task<IEnumerable<Guid>> ResolveNotificationRecipientsIds(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<TaskAssignedRequestData>();
        
        if (parameters?.AssigneeId == null)
        {
            return Task.FromResult(Enumerable.Empty<Guid>());
        }

        return Task.FromResult<IEnumerable<Guid>>([parameters.AssigneeId]);
    }

    public async Task<NotificationFullData> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<TaskAssignedRequestData>();
        
        if (parameters?.AssigneeId == null || parameters?.AssignerId == null)
        {
            throw new ArgumentException("Требуются AssigneeId и AssignerId");
        }

        var assignee = await userRepository.GetUserByIdAsync(parameters.AssigneeId);
        var assigner = await userRepository.GetUserByIdAsync(parameters.AssignerId);
        
        if (assignee == null)
        {
            throw new ArgumentException($"Исполнитель с ID {parameters.AssigneeId} не найден");
        }

        return new NotificationFullData(new TaskAssignedTemplateModel
        {
            AssigneeName = assignee.Name,
            AssignerName = assigner?.Name ?? "Система",
            TaskTitle = parameters.TaskTitle ?? "Задача без названия",
            TaskDescription = parameters.TaskDescription ?? "",
            Priority = parameters.Priority ?? "Normal",
            DueDate = parameters.DueDate ?? DateTime.UtcNow.AddDays(7),
            AssignedDate = DateTime.UtcNow
        }, "https://example.com");
    }
}

public class TaskAssignedRequestData
{
    public Guid AssigneeId { get; set; }
    public Guid AssignerId { get; set; }
    public string? TaskTitle { get; set; }
    public string? TaskDescription { get; set; }
    public string? Priority { get; set; }
    public DateTime? DueDate { get; set; }
}

public class TaskAssignedTemplateModel
{
    public string AssigneeName { get; set; } = string.Empty;
    public string AssignerName { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public string TaskDescription { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public DateTime AssignedDate { get; set; }
}

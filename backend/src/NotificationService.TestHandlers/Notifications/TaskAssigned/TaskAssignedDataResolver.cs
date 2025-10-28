using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.TestHandlers.Notifications.TaskAssigned;

public class TaskAssignedDataResolver : INotificationDataResolver
{
    private readonly IUserRepository _userRepository;

    public TaskAssignedDataResolver(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public string Route => "TaskAssigned";

    public async Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<TaskAssignedRequestData>();
        
        if (parameters?.AssigneeId == null)
        {
            return Enumerable.Empty<User>();
        }

        var user = await _userRepository.GetUserByIdAsync(parameters.AssigneeId);
        return user != null ? new[] { user } : Enumerable.Empty<User>();
    }

    public async Task<object> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<TaskAssignedRequestData>();
        
        if (parameters?.AssigneeId == null || parameters?.AssignerId == null)
        {
            throw new ArgumentException("AssigneeId and AssignerId are required");
        }

        var assignee = await _userRepository.GetUserByIdAsync(parameters.AssigneeId);
        var assigner = await _userRepository.GetUserByIdAsync(parameters.AssignerId);
        
        if (assignee == null)
        {
            throw new ArgumentException($"Assignee with ID {parameters.AssigneeId} not found");
        }

        return new TaskAssignedTemplateModel
        {
            AssigneeName = assignee.Name,
            AssignerName = assigner?.Name ?? "System",
            TaskTitle = parameters.TaskTitle ?? "Unnamed Task",
            TaskDescription = parameters.TaskDescription ?? "",
            Priority = parameters.Priority ?? "Normal",
            DueDate = parameters.DueDate ?? DateTime.Now.AddDays(7),
            AssignedDate = DateTime.Now
        };
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

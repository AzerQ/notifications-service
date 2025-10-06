using DocsvisionWebClientApi.ExtendedApi.DB.Task;
using NotificationService.Docsvision.Notifications.Common;
using NotificationService.Docsvision.Services;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Docsvision.Notifications.TaskCompleted;

public class TaskTaskCompletedNotificationDataResolver (DocsvisionEmployeeService docsvisionEmployeeService, ITaskService taskService) 
    : TaskCommonNotificationDataResolver(taskService, docsvisionEmployeeService),
        INotificationDataResolver
{
    private readonly DocsvisionEmployeeService _docsvisionEmployeeService = docsvisionEmployeeService;

    public override string Route => "TaskCompleted";
    
    public string TemplateName => "TaskCompleted";
    
    public async Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest)
    {
        var task = await GetDocsvisionTask(notificationRequest);
        return await _docsvisionEmployeeService.GetDocsvisionUserWithDeputiesAsync(task.AuthorId);
    }
    
    public new async Task<object> ResolveNotificationTemplateData(NotificationRequest notificationRequest)
    {
       return await base.ResolveNotificationTemplateData(notificationRequest);
    }
}
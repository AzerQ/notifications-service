using DocsvisionWebClientApi.ExtendedApi.DB.Task;
using NotificationService.Docsvision.Notifications.Common;
using NotificationService.Docsvision.Services;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Docsvision.Notifications.TaskCreated;

public class TaskCreatedNotificationDataResolver(
    DocsvisionEmployeeService docsvisionEmployeeService,
    ITaskService taskService)
    : TaskCommonNotificationDataResolver(taskService, docsvisionEmployeeService),
        INotificationDataResolver
{
    private readonly DocsvisionEmployeeService _docsvisionEmployeeService = docsvisionEmployeeService;

    public override string Route => "TaskCreated";

    public string TemplateName => "TaskCreated";

    public async Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest)
    {
        var task = await GetDocsvisionTask(notificationRequest);
        return [DocsvisionEmployeeService.MapEmployeeToUser(await _docsvisionEmployeeService
            .GetEmployeeByIdAsync(task.CurrentPerformerId))];
        //return await _docsvisionEmployeeService.GetDocsvisionUserWithDeputiesAsync(task.CurrentPerformerId);
    }
    
    public new async Task<object> ResolveNotificationTemplateData(NotificationRequest notificationRequest)
    {
       return await base.ResolveNotificationTemplateData(notificationRequest);
    }
}
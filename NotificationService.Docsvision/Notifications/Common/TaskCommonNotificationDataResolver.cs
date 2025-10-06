using System.Text.Json;
using DocsvisionWebClientApi.ExtendedApi.DB.Task;
using NotificationService.Docsvision.Services;
using NotificationService.Domain.Models;

namespace NotificationService.Docsvision.Notifications.Common;

public abstract class TaskCommonNotificationDataResolver(ITaskService taskService, DocsvisionEmployeeService docsvisionEmployeeService)
{
    public abstract string Route { get; }

    /// <summary>
    /// Извлечь данные из запроса на создание уведомления по заданию Docsvision
    /// </summary>
    /// <param name="notificationRequest">Запрос на отправку уведомления</param>
    /// <returns></returns>
    /// <exception cref="NullReferenceException">Не заданы параметры уведомления, в том числе TaskId</exception>
    protected TaskCommonNotificationRequestData ExtractCommonNotificationRequestData(
        NotificationRequest notificationRequest)
    {
        var taskCreatedNotificationRequestData =
            notificationRequest.Parameters.Deserialize<TaskCommonNotificationRequestData>();

        if (taskCreatedNotificationRequestData is null)
            throw new NullReferenceException($"Не переданы параметры для события уведомления {Route}");
        
        return taskCreatedNotificationRequestData;
    }
    
    protected async Task<DocvisionTask> GetDocsvisionTask(NotificationRequest notificationRequest) =>
        await taskService.GetTaskByIdAsync(ExtractCommonNotificationRequestData(notificationRequest).TaskId);
    
    public async Task<object> ResolveNotificationTemplateData(NotificationRequest notificationRequest)
    {
        var task = await GetDocsvisionTask(notificationRequest);
        TaskCommonTemplateModel templateModel = new
        (
            AuthorName: (await docsvisionEmployeeService.GetEmployeeByIdAsync(task.AuthorId)).DisplayString,
            ExecutorName: (await docsvisionEmployeeService.GetEmployeeByIdAsync(task.CurrentPerformerId)).DisplayString,
            CompletionDate: task.CompletedAt,
            TaskSubject: task.Title,
            TaskDescription: task.Description ?? string.Empty,
            TaskType: task.TaskTypeName,
            DueDate: task.PlannedCompletionAt,
            CreatedDate: task.CreatedAt
        );
        return templateModel;
    }
    
}
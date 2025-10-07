namespace NotificationService.Docsvision.Notifications.Common;

public record TaskCommonTemplateModel 
    (string AuthorName, string ExecutorName, string TaskSubject, string TaskDescription, string TaskType, DateTime? DueDate, DateTime? CompletionDate, DateTime CreatedDate);
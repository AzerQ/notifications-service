using NotificationService.Domain.Interfaces;

namespace NotificationService.Docsvision;

public static class NotificationObjectKinds
{
    public static NotificationObjectKind Task => new (nameof(Task), "Задания");
    public static NotificationObjectKind Document => new (nameof(Document), "Документ");
}
using NotificationService.Domain.Models.InApp;

namespace NotificationService.Domain.Models;

public class GetUserNotificationsRequest
{
    public bool OnlyUnread { get; set; } = false;

    public int PageSize {get; set;} = 50;

    public int PageNumber {get; set;} = 1;

}

public class UserNotificationsResponse {
    public IEnumerable<AppNotification> Notifications { get; set; }
    public GetUserNotificationsRequest Request {get; set;}
    public int TotalItemsCount {get; set;}
}
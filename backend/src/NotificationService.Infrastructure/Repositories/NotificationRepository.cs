using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly NotificationDbContext _context;

    public NotificationRepository(NotificationDbContext context)
    {
        _context = context;
    }
    
    public void SaveNotifications(params Notification[] notifications)
    {
       _context.Notifications.AddRange(notifications);
    }

    public void UpdateNotifications(params Notification[] notifications)
    {
        foreach (var notification in notifications)
        {
            User? existedUser = _context.Users.Find(notification.Recipient.Id);
            if (existedUser != null)
                notification.Recipient = existedUser;
        }
        _context.Notifications.UpdateRange(notifications);
    }

    public void SaveChanges()
    {
        _context.SaveChanges();
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId, GetUserNotificationsRequest userNotificationsRequest)
    {
        var query =  _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.DeliveryChannelsState)
            .Where(n => n.RecipientId == userId);

         if (userNotificationsRequest.OnlyUnread)
            query = query.Where(n => n.NotificationWasRead == false);

        // Apply pagination
        query = query
            .Skip((userNotificationsRequest.PageNumber - 1) * userNotificationsRequest.PageSize)
            .Take(userNotificationsRequest.PageSize);

        return await query.ToListAsync();

    }

    public async Task<Notification?> GetNotificationByIdAsync(Guid id)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.TemplateName)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public void MarkAllUserNotificationsAsRead(Guid userId)
    {
        var allUserUnreadNotifications = _context.Notifications
            .Where(n => n.RecipientId == userId && n.NotificationWasRead == false)
            .ToList();
        
        foreach (var notification in allUserUnreadNotifications)
        {
            notification.NotificationWasRead = true;
        }
        _context.UpdateRange(allUserUnreadNotifications);
    }
}

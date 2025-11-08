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

    public async Task SaveNotificationsAsync(params Notification[] notifications)
    {
        ArgumentNullException.ThrowIfNull(notifications);

        foreach (var notification in notifications)
        {
            User? existedUser = await _context.Users.FindAsync(notification.Recipient.Id);
            if (existedUser != null)
                notification.Recipient = existedUser;
        }
        
        await _context.Notifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Notification>> GetUserNotifications(Guid userId, GetUserNotificationsRequest userNotificationsRequest)
    {
        var query =  _context.Notifications
            .Include(n => n.Recipient)
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
            .Include(n => n.Template)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task UpdateNotificationsAsync(params Notification[] notifications)
    {
         _context.UpdateRange(notifications);
        await _context.SaveChangesAsync();
    }
}

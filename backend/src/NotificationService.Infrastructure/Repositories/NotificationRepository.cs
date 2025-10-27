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

    public async Task<IEnumerable<Notification>> GetNotificationsForUserAsync(Guid userId)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Template)
            .Where(n => n.Recipient.Id == userId)
            .ToListAsync();
    }

    public async Task<Notification?> GetNotificationByIdAsync(Guid id)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Template)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<IEnumerable<Notification>> GetNotificationsByStatusAsync(NotificationDeliveryStatus status)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Template)
            .Include(n => n.DeliveryChannelsState)
            .Where(n => n.DeliveryChannelsState.Any(channel => channel.DeliveryStatus == status))
            .ToListAsync();
    }

    public async Task UpdateNotificationsAsync(params Notification[] notifications)
    {
         _context.UpdateRange(notifications);
        await _context.SaveChangesAsync();
    }
}

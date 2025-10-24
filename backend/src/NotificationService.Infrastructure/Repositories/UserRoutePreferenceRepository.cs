using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Repositories;

public class UserRoutePreferenceRepository : IUserRoutePreferenceRepository
{
    private readonly NotificationDbContext _context;

    public UserRoutePreferenceRepository(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<UserRoutePreference>> GetByUserAsync(Guid userId)
    {
        var list = await _context.UserRoutePreferences
            .Where(p => p.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
        return list.AsReadOnly();
    }

    public async Task SetPreferencesAsync(Guid userId, IEnumerable<UserRoutePreference> preferences)
    {
        ArgumentNullException.ThrowIfNull(preferences);

        var existing = await _context.UserRoutePreferences.Where(p => p.UserId == userId).ToListAsync();
        _context.UserRoutePreferences.RemoveRange(existing);
        await _context.UserRoutePreferences.AddRangeAsync(preferences);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsRouteEnabledAsync(Guid userId, string route)
    {
        if (string.IsNullOrWhiteSpace(route)) return true; // пустой маршрут считаем включенным

        var pref = await _context.UserRoutePreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Route == route);

        return pref?.Enabled ?? true; // по умолчанию все маршруты включены
    }
}

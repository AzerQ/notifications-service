using Microsoft.EntityFrameworkCore;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Repositories;

public class UserRoutePreferenceRepository(
    NotificationDbContext context,
    INotificationRoutesService notificationRoutesService)
    : IUserRoutePreferenceRepository
{
    private readonly IEnumerable<NotificationRouteConfiguration> _notificationRoutes = notificationRoutesService.GetAllNotificationRoutesConfigurations();

    private IEnumerable<UserRoutePreference> GetDefaultPreferencesForUser(Guid userId)
    {
        return _notificationRoutes
            .Select(r => UserPreferencesMapper.GetDefaultPreference(userId, r.Name));
    }

    private IEnumerable<UserRoutePreferenceView> ToRoutePreferenceView(IEnumerable<UserRoutePreference> source) {
        return source.Select(p =>
        {
            var routeConfig = _notificationRoutes
                .FirstOrDefault(r => r.Name == p.Route)!;
            return UserPreferencesMapper.ToView(p, routeConfig);
        });
    }

    private IEnumerable<UserRoutePreference> MergePreferences(IEnumerable<UserRoutePreference> currentUserPreferences, IEnumerable<UserRoutePreference> defaultPreferences) {
        return defaultPreferences.Select(dp => currentUserPreferences.FirstOrDefault(cup => cup.Route == dp.Route) ?? dp);
    }
    

    public async Task<IEnumerable<UserRoutePreferenceView>> GetByUserAsync(Guid userId)
    {
        var userRoutePreferences = await context.UserRoutePreferences
            .Where(p => p.UserId == userId)
            .AsNoTracking()
            .ToListAsync();

        var mergedPreferences = MergePreferences(userRoutePreferences, GetDefaultPreferencesForUser(userId));
        return ToRoutePreferenceView(mergedPreferences);
    }

    public async Task SetPreferencesAsync(Guid userId, IEnumerable<UserPreferenceDto> preferences)
    {
        ArgumentNullException.ThrowIfNull(preferences);
        var userPreferenceDtos = preferences.ToList();
        var preferencesIds = userPreferenceDtos.Where(p => p.Id is not null).Select(p => p.Id).ToList();

        var newPreferences = userPreferenceDtos.Where(p => p.Id is null)
            .Select(p => UserPreferencesMapper.ToModel(p, userId));

        await context.UserRoutePreferences.AddRangeAsync(newPreferences);

        var existingPreferences = await context.UserRoutePreferences
            .Where(p => preferencesIds.Contains(p.Id)).ToListAsync();

        existingPreferences.ForEach(p =>
        {
            var preferenceDto = userPreferenceDtos.FirstOrDefault(dto => dto.Id == p.Id);
            if (preferenceDto is not null)
                UserPreferencesMapper.UpdateModel(p, preferenceDto);
        });

        context.UserRoutePreferences.UpdateRange(existingPreferences);
        await context.SaveChangesAsync();
    }

    public async Task<bool> IsRouteEnabledAsync(Guid userId, string route)
    {
        if (string.IsNullOrWhiteSpace(route)) return true; // пустой маршрут считаем включенным

        var pref = await context.UserRoutePreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Route == route);

        return pref?.Enabled ?? true; // по умолчанию все маршруты включены
    }
}

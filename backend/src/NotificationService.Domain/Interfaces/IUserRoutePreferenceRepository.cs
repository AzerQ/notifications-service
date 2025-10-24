using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface IUserRoutePreferenceRepository
{
    Task<IReadOnlyCollection<UserRoutePreference>> GetByUserAsync(Guid userId);
    Task SetPreferencesAsync(Guid userId, IEnumerable<UserRoutePreference> preferences);
    Task<bool> IsRouteEnabledAsync(Guid userId, string route);
}

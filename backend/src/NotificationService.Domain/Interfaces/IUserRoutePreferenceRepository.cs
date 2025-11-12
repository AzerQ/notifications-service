using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface IUserRoutePreferenceRepository
{
    Task<IEnumerable<UserRoutePreferenceView>> GetByUserAsync(Guid userId);
    Task SetPreferencesAsync(Guid userId, IEnumerable<UserPreferenceDto> preferences);
    Task<bool> IsRouteEnabledAsync(Guid userId, string route);
}

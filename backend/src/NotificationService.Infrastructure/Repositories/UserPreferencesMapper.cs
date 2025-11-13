using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Infrastructure.Repositories;

static class UserPreferencesMapper {
    
  public static UserRoutePreferenceView ToView(UserRoutePreference preference, INotificationRouteConfiguration? routeConfig)
  {
    return new UserRoutePreferenceView
    {
      Id = (preference.Id != Guid.Empty) ? preference.Id : null,
      UserId = preference.UserId,
      Route = preference.Route,
      RouteDisplayName = routeConfig?.DisplayName ?? preference.Route,
      RouteDescription = routeConfig?.Description,
      Enabled = preference.Enabled
    };
  }

  public static UserRoutePreference ToModel(UserPreferenceDto dto, Guid userId)
  {
    return new UserRoutePreference
    {
      Id = dto.Id ?? Guid.NewGuid(),
      UserId = userId,
      Route = dto.Route,
      Enabled = dto.Enabled
    };
  }

  public static void UpdateModel(UserRoutePreference preference, UserPreferenceDto dto)
  {
    preference.Route = dto.Route;
    preference.Enabled = dto.Enabled;
  }

  public static UserRoutePreference GetDefaultPreference(Guid userId, string route)
  {
    return new UserRoutePreference
    {
      Id = Guid.Empty,
      UserId = userId,
      Route = route,
      Enabled = true
    };
  }

}
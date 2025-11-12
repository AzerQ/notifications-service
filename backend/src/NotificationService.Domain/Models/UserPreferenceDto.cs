namespace NotificationService.Domain.Models;

public record UserPreferenceDto(string Route, bool Enabled, Guid? Id = null);

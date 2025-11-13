namespace NotificationService.Domain.Models;

public class UserRoutePreferenceView
{
    public Guid? Id { get; set; }
    public Guid UserId { get; set; }
    public string Route { get; set; } = null!;
    public bool Enabled { get; set; } = true;
    public string RouteDisplayName { get; set; } = string.Empty;
    public string? RouteDescription { get; set; }
}
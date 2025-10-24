namespace NotificationService.Domain.Models;

public class UserRoutePreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Route { get; set; } = string.Empty; // семантический идентификатор маршрута
    public bool Enabled { get; set; } = true;
}

namespace NotificationService.Domain.Models;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string? DeviceToken { get; set; }
    public string? PasswordHash { get; set; }
    public string? Role { get; set; } = "User";

    public ICollection<UserAttribute> Attributes { get; set; } = new List<UserAttribute>();
}

public record UserAttribute
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public required string Key { get; set; }
    public required string Value { get; set; }
}
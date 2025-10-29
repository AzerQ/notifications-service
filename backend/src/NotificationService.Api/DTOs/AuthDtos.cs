namespace NotificationService.Api.DTOs;

public record LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public record RegisterRequest
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? PhoneNumber { get; set; }
}

public record AuthResponse
{
    public required string Token { get; set; }
    public required UserDto User { get; set; }
}

public record UserDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }
}

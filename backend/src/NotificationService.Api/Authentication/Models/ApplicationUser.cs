using NotificationService.Domain.Models;
using System.Security.Claims;

namespace NotificationService.Api.Authentication.Models;

public record ApplicationUser
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }

    public static ApplicationUser MapFromUser(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role
    };

    public static ApplicationUser MapFromClaims(IEnumerable<Claim> claims)
    {
        var claimList = claims.ToList();
        return new ApplicationUser
        {
            Id = Guid.Parse(claimList.First(c => c.Type == ClaimTypes.NameIdentifier).Value),
            Name = claimList.First(c => c.Type == ClaimTypes.Name).Value,
            Email = claimList.First(c => c.Type == ClaimTypes.Email).Value,
            PhoneNumber = claimList.FirstOrDefault(c => c.Type == ClaimTypes.MobilePhone)?.Value,
            Role = claimList.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value
        };
    }

    public IEnumerable<Claim> ToClaims()
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Id.ToString()),
            new(ClaimTypes.Name, Name),
            new(ClaimTypes.Email, Email)
        };
        if (!string.IsNullOrEmpty(PhoneNumber))
        {
            claims.Add(new Claim(ClaimTypes.MobilePhone, PhoneNumber));
        }
        if (!string.IsNullOrEmpty(Role))
        {
            claims.Add(new Claim(ClaimTypes.Role, Role));
        }
        return claims;
    }
}

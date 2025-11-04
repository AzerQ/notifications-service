using NotificationService.Domain.Models;
using System.Security.Claims;

namespace NotificationService.Api.Authentication.Extensions;

/// <summary>
/// Расширения для работы с ClaimsPrincipal для извлечения информации о пользователе
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Получить ID пользователя из claims
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        // Пробуем сначала короткое имя, потом полное URI
        var userIdClaim = principal.FindFirst("sub")?.Value
                ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return null;

        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Получить email пользователя из claims
    /// </summary>
    public static string? GetUserEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("email")?.Value
         ?? principal.FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <summary>
    /// Получить имя пользователя из claims
    /// </summary>
    public static string? GetUserName(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("name")?.Value
                ?? principal.FindFirst(ClaimTypes.Name)?.Value;
    }

    /// <summary>
    /// Получить роль пользователя из claims
    /// </summary>
    public static string? GetUserRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("role")?.Value
         ?? principal.FindFirst(ClaimTypes.Role)?.Value;
    }

    /// <summary>
  /// Проверить, является ли пользователь администратором
    /// </summary>
  public static bool IsAdmin(this ClaimsPrincipal principal)
{
        var role = GetUserRole(principal);
        return role?.Equals(UserRoles.Admin, StringComparison.OrdinalIgnoreCase) == true
            || principal.IsInRole(UserRoles.Admin);
    }
}

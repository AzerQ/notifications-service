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
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
     return null;

        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Получить email пользователя из claims
    /// </summary>
    public static string? GetUserEmail(this ClaimsPrincipal principal)
    {
   return principal.FindFirst(ClaimTypes.Email)?.Value;
    }

 /// <summary>
    /// Получить имя пользователя из claims
    /// </summary>
    public static string? GetUserName(this ClaimsPrincipal principal)
    {
return principal.FindFirst(ClaimTypes.Name)?.Value;
    }

    /// <summary>
    /// Получить роль пользователя из claims
    /// </summary>
    public static string? GetUserRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Role)?.Value;
    }

    /// <summary>
    /// Проверить, является ли пользователь администратором
    /// </summary>
    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
   return principal.IsInRole(UserRoles.Admin);
    }
}

using NotificationService.Api.Authentication.Models;
using System.Security.Claims;

namespace NotificationService.Api.Authentication.Extensions;

/// <summary>
/// Extensions for working with ClaimsPrincipal to extract user information
/// </summary>
public static class ClaimsPrincipalExtensions
{
   
    /// <summary>
    /// Check if user is admin
    /// </summary>
    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
        return GetApplicationUser(principal).IsAdmin;
    }

    /// <summary>
    /// Get ApplicationUser object from ClaimsPrincipal
    /// Extracts all user information from JWT claims and returns as ApplicationUser
    /// </summary>
    /// <returns>ApplicationUser object or null if required claims are missing</returns>
    public static ApplicationUser GetApplicationUser(this ClaimsPrincipal principal)
    {
        return ApplicationUser.MapFromClaims(principal.Claims);
    }
}

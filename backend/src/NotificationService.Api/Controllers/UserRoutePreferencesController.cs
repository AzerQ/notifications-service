using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Api.Authentication;
using NotificationService.Api.Authentication.Extensions;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/users/{userId:guid}/routes")]
[Authorize(Policy = AuthConfig.JwtAuthPolicyName)]
public class UserRoutePreferencesController : ControllerBase
{
    private readonly IUserRoutePreferenceRepository _repo;

    public UserRoutePreferencesController(IUserRoutePreferenceRepository repo)
    {
        _repo = repo;
    }

    /// <summary>
    /// Gets route notification preferences for a user.
    /// Regular users can only retrieve their own preferences, administrators can retrieve any.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserRoutePreferenceView>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<UserRoutePreferenceView>>> Get(Guid userId)
    {
        var currentUserId = User.GetApplicationUser().Id;

        // Permission check: user can only retrieve their own preferences
        if (currentUserId != userId && !User.IsAdmin())
        {
            return Forbid();
        }

        var prefs = await _repo.GetByUserAsync(userId);
        return Ok(prefs);
    }

    /// <summary>
    /// Updates route notification preferences for a user.
    /// Regular users can only update their own preferences, administrators can update any.
    /// </summary>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Put(Guid userId, [FromBody] IEnumerable<UserPreferenceDto> prefs)
    {
        var currentUserId = User.GetApplicationUser().Id;

        // Permission check: user can only update their own preferences
        if (currentUserId != userId && !User.IsAdmin())
        {
            return Forbid();
        }

        var entities = prefs.Select(p => new UserRoutePreference
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Route = p.Route,
            Enabled = p.Enabled
        });

        await _repo.SetPreferencesAsync(userId, prefs);
        return NoContent();
    }
}

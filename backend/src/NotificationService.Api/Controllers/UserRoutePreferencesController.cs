using Microsoft.AspNetCore.Mvc;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/users/{userId:guid}/routes")]
public class UserRoutePreferencesController : ControllerBase
{
    private readonly IUserRoutePreferenceRepository _repo;

    public UserRoutePreferencesController(IUserRoutePreferenceRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserRoutePreference>>> Get(Guid userId)
    {
        var prefs = await _repo.GetByUserAsync(userId);
        return Ok(prefs);
    }

    public record PreferenceDto(string Route, bool Enabled);

    [HttpPut]
    public async Task<IActionResult> Put(Guid userId, [FromBody] IEnumerable<PreferenceDto> prefs)
    {
        var entities = prefs.Select(p => new UserRoutePreference
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Route = p.Route,
            Enabled = p.Enabled
        });

        await _repo.SetPreferencesAsync(userId, entities);
        return NoContent();
    }
}

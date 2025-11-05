using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Api.Authentication;
using NotificationService.Api.Authentication.Extensions;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthConfig.JwtAuthPolicyName)]
public class UsersController(IUserRepository userRepository) : ControllerBase
{
    /// <summary>
    /// Gets a list of all users (admin only).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(typeof(IEnumerable<User>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IEnumerable<User>> GetAllUsers()
    {
        return await userRepository.GetAllUsersAsync();
    }

    /// <summary>
    /// Creates new users (admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> AddNewUsers([FromBody] IEnumerable<User> users) {
        await userRepository.CreateUsersAync(users);
        return NoContent();
    }

    /// <summary>
    /// Gets a user by ID.
    /// Regular users can only retrieve their own data, administrators can retrieve any.
    /// </summary>
    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> GetUserById(Guid userId)
    {
        var currentUserId = User.GetUserId();

        // Permission check: user can only retrieve their own data
        if (currentUserId != userId && !User.IsAdmin())
        {
            return Forbid();
        }

        var user = await userRepository.GetUserByIdAsync(userId);
        if (user is null)
            return NotFound();

        return Ok(user);
    }
}

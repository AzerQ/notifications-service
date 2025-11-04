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
    /// Получить список всех пользователей (только для администраторов)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(typeof(IEnumerable<User>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IEnumerable<User>> GetAllUsers() {
        return await userRepository.GetAllUsersAsync();
    }

    /// <summary>
    /// Добавить новых пользователей (только для администраторов)
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
    /// Получить пользователя по ID.
    /// Обычные пользователи могут получить только свою информацию, администраторы - любую.
    /// </summary>
    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
 [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> GetUserById(Guid userId) {
        var currentUserId = User.GetUserId();
        
   // Проверка прав: пользователь может получить только свою информацию
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
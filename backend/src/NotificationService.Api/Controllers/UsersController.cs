using Microsoft.AspNetCore.Mvc;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Controllers;

public class UsersController(IUserRepository userRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<User>> GetAllUsers() {
        return await userRepository.GetAllUsersAsync();
    }

    [HttpPost]
    public async Task AddNewUsers([FromBody] IEnumerable<User> users) {
        await userRepository.CreateUsersAync(users);
    }

    [HttpGet]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetUserById(Guid userId) {
        var user = await userRepository.GetUserByIdAsync(userId);
        if (user is null)
            return NotFound();

        return Ok(user);
    
    }

}
using Microsoft.AspNetCore.Mvc;
using NotificationService.Api.DTOs;
using NotificationService.Api.Services.Authentication.MailVerify;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMailChallenger mailChallenger) : ControllerBase
{


    [HttpPost("email/sendCode")]
    public async Task<CreatedMailChallengeResponse> SendMailCode([FromQuery] string email) {
       var mailChallenge = await mailChallenger.GenerateMailChallenge(email);
       return new CreatedMailChallengeResponse()
    }

    /// <summary>
    /// Login with email
    /// </summary>
    [HttpPost("email")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(response);
    }



}

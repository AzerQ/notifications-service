using Microsoft.AspNetCore.Mvc;
using NotificationService.Api.Authentication.MailVerify;
using NotificationService.Api.Authentication.Models;
using NotificationService.Api.Authentication.Services;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Authentication.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IMailChallenger mailChallenger,
    IRefreshTokenRepository refreshTokenRepository,
    ITokenService tokenService,
    IConfiguration configuration) : ControllerBase
{

    [HttpPost("email/sendCode")]
    public async Task<CreatedMailChallengeResponse> SendMailCode([FromQuery] string email)
    {
        return await mailChallenger.GenerateMailChallenge(email);
    }

    /// <summary>
    /// Login with email
    /// </summary>
    [HttpPost("email")]
    [ProducesResponseType(typeof(LoginTokensResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginTokensResponse>> LoginByEmail([FromBody] MailChallengeSubmit mailChallengeSubmit)
    {
        var mailChallengeResult = await mailChallenger.VerifyMailChallengeAnswer(mailChallengeSubmit);

        if (!mailChallengeResult.IsValid)
        {
            return Unauthorized(new { message = "Invalid email or code" });
        }

        User user = mailChallengeResult.User!;

        string accessToken = MakeAcessTokenForUser(user);

        string refreshToken = await MakeRefreshTokenForUser(user);

        return new LoginTokensResponse(refreshToken, accessToken);
    }

    private async Task<string> MakeRefreshTokenForUser(User user)
    {
        var refreshToken = tokenService.GenerateRefreshToken();
        int refreshTokenExpiryHours = configuration.GetValue<int>("JwtSettings:RefreshTokenExpirationHours");
        DateTime expiresAt = DateTime.UtcNow.AddHours(refreshTokenExpiryHours);
        await refreshTokenRepository.SaveRefreshTokenAsync(user.Id, refreshToken, expiresAt);
        return refreshToken;
    }

    private string MakeAcessTokenForUser(User user)
    {
        var userClaims = ApplicationUser.MapFromUser(user).ToClaims();
        return tokenService.GenerateAccessToken(userClaims);
    }


    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AccessTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AccessTokenResponse>> RefreshAccessToken([FromBody] RefreshTokenRequest refreshTokenRequest)
    {
        var refreshToken = await refreshTokenRepository.GetRefreshTokenAsync(refreshTokenRequest.RefreshTokenValue);
        
        if (refreshToken is null || refreshToken.IsExpired)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        return new AccessTokenResponse(MakeAcessTokenForUser(refreshToken.User!));
    }
}

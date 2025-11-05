using Microsoft.AspNetCore.Authorization;
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
    IUserRepository userRepository,
    IConfiguration configuration) : ControllerBase
{

    /// <summary>
    /// Sends a verification code to the specified email address.
    /// </summary>
    /// <param name="email">Email address to send the verification code to.</param>
    /// <returns>Mail challenge response with challenge ID and expiration time.</returns>
    [HttpPost("email/sendCode")]
    [AllowAnonymous]
    public async Task<CreatedMailChallengeResponse> SendMailCode([FromQuery] string email)
    {
        return await mailChallenger.GenerateMailChallenge(email);
    }

    /// <summary>
    /// Authenticates user with email and verification code.
    /// </summary>
    /// <param name="mailChallengeSubmit">Email and verification code submission.</param>
    /// <returns>Access and refresh tokens for authenticated user.</returns>
    [HttpPost("email")]
    [ProducesResponseType(typeof(LoginTokensResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [AllowAnonymous]
    public async Task<ActionResult<LoginTokensResponse>> LoginByEmail([FromBody] MailChallengeSubmit mailChallengeSubmit)
    {
        var mailChallengeResult = await mailChallenger.VerifyMailChallengeAnswer(mailChallengeSubmit);

        if (!mailChallengeResult.IsValid)
        {
            return Unauthorized(new { message = "Invalid email or code" });
        }

        User user = mailChallengeResult.User!;

        string accessToken = MakeAccessTokenForUser(user);

        string refreshToken = await MakeRefreshTokenForUser(user);

        return new LoginTokensResponse(refreshToken, accessToken);
    }

    /// <summary>
    /// Windows Authentication - performs authentication using Windows credentials.
    /// </summary>
    /// <returns>JWT tokens for authenticated user.</returns>
    [HttpPost("windows")]
    [Authorize(Policy = AuthConfig.WindowsAuthPolicyName)]
    [ProducesResponseType(typeof(LoginTokensResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoginTokensResponse>> LoginByWindows()
    {
        // Get Windows identity from the current user
        var windowsIdentity = User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(windowsIdentity))
        {
            return Unauthorized(new { message = "Windows identity not found" });
        }

        // Find user by account name (format: DOMAIN\username)
        var user = await userRepository.GetByAccountNameAsync(windowsIdentity);

        if (user is null)
        {
            return NotFound(new { message = $"User with account name '{windowsIdentity}' not found in the system" });
        }

        string accessToken = MakeAccessTokenForUser(user);
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

    private string MakeAccessTokenForUser(User user)
    {
        var userClaims = ApplicationUser.MapFromUser(user).ToClaims();
        
        var externalApiClientsAccessTokenExpirationInDays = configuration.GetValue<int>("JwtSettings:ExternalApiClientsAccessTokenExpirationInDays");
        DateTime? expires = user.Role == UserRoles.ExternalApiClient ? 
            DateTime.UtcNow.AddDays(externalApiClientsAccessTokenExpirationInDays) 
            : null;
        
        return tokenService.GenerateAccessToken(userClaims, expires);
    }

    /// <summary>
    /// Refreshes the access token using a valid refresh token.
    /// </summary>
    /// <param name="refreshTokenRequest">Refresh token request containing the refresh token value.</param>
    /// <returns>New access token.</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AccessTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [AllowAnonymous]
    public async Task<ActionResult<AccessTokenResponse>> RefreshAccessToken([FromBody] RefreshTokenRequest refreshTokenRequest)
    {
        var refreshToken = await refreshTokenRepository.GetRefreshTokenAsync(refreshTokenRequest.RefreshTokenValue);
        
        if (refreshToken is null || refreshToken.IsExpired)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        return new AccessTokenResponse(MakeAccessTokenForUser(refreshToken.User!));
    }
}

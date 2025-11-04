using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace NotificationService.Api.Services.Authentication;

/// <summary>
/// Provides token generation and validation services for JWT authentication.
/// </summary>
public interface ITokenService
{
  /// <summary>
  /// Generates a JWT access token with the specified claims.
  /// </summary>
  /// <param name="claims">Collection of claims to include in the token.</param>
  /// <returns>A JWT access token string.</returns>
  string GenerateAccessToken(IEnumerable<Claim> claims);
    
  /// <summary>
  /// Generates a cryptographically secure refresh token.
  /// </summary>
  /// <returns>A Base64-encoded refresh token string.</returns>
  string GenerateRefreshToken();
    
  /// <summary>
  /// Extracts and validates claims from an expired JWT token.
  /// </summary>
  /// <param name="token">The expired JWT token string.</param>
  /// <returns>A ClaimsPrincipal containing the extracted claims.</returns>
  /// <exception cref="SecurityTokenException">Thrown when the token is invalid or uses an unsupported algorithm.</exception>
  ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}
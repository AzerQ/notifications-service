using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;


namespace NotificationService.Api.Authentication.Services;

/// <summary>
/// Implements JWT token generation and validation for authentication.
/// Handles access token creation, refresh token generation, and token validation.
/// </summary>
public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Initializes a new instance of the <see cref="TokenService"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration containing JWT settings.</param>
    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generates a JWT access token with the specified claims.
    /// The token is signed using HMAC-SHA256 and configured with issuer, audience, and expiration settings from the application configuration.
    /// </summary>
    /// <param name="claims">Collection of security claims to include in the token payload.</param>
    /// <returns>A signed JWT access token string.</returns>
    public string GenerateAccessToken(IEnumerable<Claim> claims, DateTime? expires = null)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
        
        var signinCredentials = new SigningCredentials(
            secretKey, SecurityAlgorithms.HmacSha256);

        var tokeOptions = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expires ?? DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["AccessTokenExpirationMinutes"])),
            signingCredentials: signinCredentials
        );

        return new JwtSecurityTokenHandler().WriteToken(tokeOptions);
    }

    /// <summary>
    /// Generates a cryptographically secure refresh token using a random number generator.
    /// The token is 32 bytes long and encoded as a Base64 string.
    /// </summary>
    /// <returns>A Base64-encoded random refresh token string.</returns>
    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    /// <summary>
    /// Extracts claims from an expired JWT token without validating its lifetime.
    /// This method is used during token refresh operations to retrieve user information from expired access tokens.
    /// </summary>
    /// <param name="token">The expired JWT token to validate and extract claims from.</param>
    /// <returns>A <see cref="ClaimsPrincipal"/> containing the extracted claims from the token.</returns>
    /// <exception cref="SecurityTokenException">Thrown when the token signature is invalid or the signing algorithm is not HMAC-SHA256.</exception>
    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(
            token, tokenValidationParameters, out SecurityToken securityToken);
        
        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(
                SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
}
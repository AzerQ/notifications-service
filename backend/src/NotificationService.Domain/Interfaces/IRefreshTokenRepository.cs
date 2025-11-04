using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

/// <summary>
/// Defines the contract for managing refresh tokens in the data store.
/// Provides operations for retrieving, saving, and revoking refresh tokens associated with users.
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Retrieves the refresh token object by its string value.
    /// </summary>
    /// <param name="refreshTokenValue">The refresh token string to search for.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The task result contains the RefreshToken object if found,
    /// or null if no matching token exists.
    /// </returns>
    Task<RefreshToken?> GetRefreshTokenAsync(string refreshTokenValue);
    
    /// <summary>
    /// Saves or updates a refresh token for a specific user.
    /// If a token already exists for the user, it is replaced with the new one.
    /// </summary>
    /// <param name="userId">The unique identifier of the user for whom the token is being saved.</param>
    /// <param name="refreshToken">The cryptographic refresh token string to save.</param>
    /// <param name="expires">The expiration date and time for the refresh token.</param>
    /// <returns>A task representing the asynchronous save operation.</returns>
    Task SaveRefreshTokenAsync(Guid userId, string refreshToken, DateTime expires);

    /// <summary>
    /// Rotates the refresh tokens for a specific user by generating a new token and invalidating the old ones.
    /// This operation is typically performed during token refresh to enhance security.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose tokens are being rotated.</param>
    /// <returns>A task representing the asynchronous token rotation operation.</returns>
    Task RotateUserTokens(Guid userId);

    /// <summary>
    /// Revokes (invalidates) the refresh token for a specific user.
    /// After revocation, the user must re-authenticate to obtain new tokens.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose refresh token is being revoked.</param>
    /// <returns>A task representing the asynchronous revocation operation.</returns>
    Task RevokeAllUserRefreshTokensAsync(Guid userId);

    /// <summary>
    /// Removes all refresh tokens that have expired based on their expiration date.
    /// This method is typically used for cleanup purposes to maintain data store efficiency.
    /// </summary>
    /// <returns>A task representing the asynchronous cleanup operation.</returns>
    Task RemoveAllOutdatedRefreshTokens();
}
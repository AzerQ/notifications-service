using System.ComponentModel.DataAnnotations;

namespace NotificationService.Domain.Models;

/// <summary>
/// Represents a refresh token used for obtaining new access tokens without re-authentication.
/// Refresh tokens have a longer lifetime than access tokens and can be revoked by blocking.
/// </summary>
public class RefreshToken
{
  
  /// <summary>
  /// Gets or sets the expiration date and time of the refresh token.
  /// After this time, the token cannot be used to request new access tokens.
  /// </summary>
  public DateTime ExpiresAt {get; set;}
  
  /// <summary>
  /// Gets or sets the cryptographic token value hash.
  /// This is the actual token string that clients use in refresh requests.
  /// </summary>
  [Key]
  public string TokenHash {get; set;} = null!;
  
  /// <summary>
  /// Gets or sets the unique identifier of the user who owns this refresh token.
  /// Foreign key reference to the User entity.
  /// </summary>
  public Guid UserId {get; set;}
  
  /// <summary>
  /// Gets or sets the associated user entity.
  /// Navigation property for the relationship between RefreshToken and User.
  /// </summary>
  public User User {get; set;} = null!;
}
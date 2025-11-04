using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;
using NotificationService.Infrastructure.Services;

namespace NotificationService.Infrastructure.Repositories;

public class RefreshTokenRepository(
  NotificationDbContext notificationDb,
  IStringHasher stringHasher,
  IConfiguration configuration)
  : IRefreshTokenRepository
{
  public async Task<RefreshToken?> GetRefreshTokenAsync(string refreshTokenValue)
  {
    string refreshTokenHash = stringHasher.GetStringHash(refreshTokenValue);
    var refresh = await notificationDb
            .RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == refreshTokenHash);
    return refresh;
  }

  public async Task SaveRefreshTokenAsync(Guid userId, string refreshToken, DateTime expires)
  {
    var refreshTokenEntity = new RefreshToken
      { UserId = userId, TokenHash = stringHasher.GetStringHash(refreshToken), ExpiresAt = expires };

    await notificationDb.AddAsync(refreshTokenEntity);
    await notificationDb.SaveChangesAsync();
    await RotateUserTokens(userId);
  }

  public async Task RotateUserTokens(Guid userId)
  {
    int maxRefreshTokensCountByUser = configuration.GetValue<int?>("JwtSettings:RefreshTokensForUserMaxCount") ?? 5;
    var allUserRefreshTokens = await GetAllRefreshTokensByUser(userId);
    int exceedTokenLimit = allUserRefreshTokens.Count - maxRefreshTokensCountByUser;

    if (exceedTokenLimit > 0)
    {
      var tokensToDelete = allUserRefreshTokens
        .OrderBy(t => t.ExpiresAt)
        .Take(exceedTokenLimit);

      notificationDb.RemoveRange(tokensToDelete);
      await notificationDb.SaveChangesAsync();
    }
  }

  public async Task RevokeAllUserRefreshTokensAsync(Guid userId)
  {
    var allUserRefreshTokens = GetAllRefreshTokensByUser(userId);
    notificationDb.RemoveRange(allUserRefreshTokens);
    await notificationDb.SaveChangesAsync();
  }

  public async Task RemoveAllOutdatedRefreshTokens()
  {
    var now = DateTime.UtcNow;
    await notificationDb.RefreshTokens
      .Where(r => r.ExpiresAt < now)
      .ExecuteDeleteAsync();
  }

  private async Task<IList<RefreshToken>> GetAllRefreshTokensByUser(Guid userId) =>
    await notificationDb.RefreshTokens
      .Where(r => r.UserId == userId).ToListAsync();
}
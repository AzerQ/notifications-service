using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace NotificationService.Infrastructure.Services;

/// <inheritdoc />
public class StringHasher(IConfiguration configuration) : IStringHasher
{
  private const string SaultConfigurationKey = "JwtSettings:RefreshTokenSault";
  private const int Iterations = 100_000;
  private readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA512;
  private const int KeySize = 64;

  private byte[] GetHashSault()
  {
    string saultString = configuration[SaultConfigurationKey] ?? 
                         Environment.MachineName;
    return Encoding.UTF8.GetBytes(saultString);
  }

  /// <inheritdoc/>
  public string GetStringHash(string value)
  {
    var hash = Rfc2898DeriveBytes.Pbkdf2(
      Encoding.UTF8.GetBytes(value),
      GetHashSault(),
      Iterations,
      HashAlgorithm,
      KeySize);

    return Convert.ToHexString(hash);
  }

  /// <inheritdoc/>
  public bool CheckValueIsCorrect(string hashInBase64, string source)
  {
    string sourceHash = GetStringHash(source);
    return sourceHash.Equals(hashInBase64);
  }
}
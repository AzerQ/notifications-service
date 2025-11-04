namespace NotificationService.Infrastructure.Services;

/// <summary>
/// Defines the contract for hashing strings and verifying hashed values.
/// Provides methods for generating secure hashes in Base64 format and validating source strings against existing hashes.
/// </summary>
public interface IStringHasher
{
   /// <summary>
   /// Computes a cryptographic hash of the provided string value and returns it in Base64 format.
   /// </summary>
   /// <param name="value">The string value to hash.</param>
   /// <returns>The hash of the input value encoded in Base64 format.</returns>
   string GetStringHash(string value);

   /// <summary>
   /// Verifies whether the provided source string matches the given Base64-encoded hash.
   /// </summary>
   /// <param name="hashInBase64">The Base64-encoded hash to verify against.</param>
   /// <param name="source">The original source string to check.</param>
   /// <returns>True if the source string matches the hash, otherwise false.</returns>
   bool CheckValueIsCorrect(string hashInBase64, string source);
}
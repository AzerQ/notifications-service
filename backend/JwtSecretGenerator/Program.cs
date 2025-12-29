using System.Security.Cryptography;

Console.WriteLine("Secret Key and Salt Generator");
Console.WriteLine(new string('-', 40));

try
{
    // Generate secret key (minimum 256 bits = 32 bytes)
    int keySizeBytes = ReadPositiveInt("Enter key size in bytes (minimum 32 for 256 bits): ", 32);
    byte[] secretKey = GenerateRandomBytes(keySizeBytes);
    string secretKeyBase64 = Convert.ToBase64String(secretKey);
    
    Console.WriteLine($"\nGenerated {keySizeBytes * 8}-bit key ({keySizeBytes} bytes)");

    // Generate salt
    int saltSizeBytes = ReadPositiveInt("Enter salt size in bytes (recommended 16-32 bytes): ", 16);
    byte[] salt = GenerateRandomBytes(saltSizeBytes);
    string saltBase64 = Convert.ToBase64String(salt);
    
    Console.WriteLine($"\nGenerated {saltSizeBytes * 8}-bit salt ({saltSizeBytes} bytes)");

    // Display results
    Console.WriteLine(new string('-', 40));
    Console.WriteLine("\n=== SECRET KEY ===");
    Console.WriteLine(secretKeyBase64);
    Console.WriteLine("\n=== SALT ===");
    Console.WriteLine(saltBase64);
    
    // Additional information
    Console.WriteLine(new string('-', 40));
    Console.WriteLine("\nInformation:");
    Console.WriteLine($"Key (Base64 length): {secretKeyBase64.Length} characters");
    Console.WriteLine($"Salt (Base64 length): {saltBase64.Length} characters");
    Console.WriteLine($"Key (hex): {BitConverter.ToString(secretKey).Replace("-", "").ToLower()}");
    Console.WriteLine($"Salt (hex): {BitConverter.ToString(salt).Replace("-", "").ToLower()}");
}
catch (Exception ex)
{
    Console.WriteLine($"\nError: {ex.Message}");
}

// Method to generate cryptographically secure random bytes
static byte[] GenerateRandomBytes(int length)
{
    using var rng = RandomNumberGenerator.Create();
    byte[] randomBytes = new byte[length];
    rng.GetBytes(randomBytes);
    return randomBytes;
}

// Method to read a positive integer
static int ReadPositiveInt(string prompt, int defaultValue)
{
    Console.Write(prompt);
    string input = Console.ReadLine()?.Trim() ?? "";
    
    if (string.IsNullOrEmpty(input))
    {
        Console.WriteLine($"Using default value: {defaultValue}");
        return defaultValue;
    }
    
    if (int.TryParse(input, out int value) && value > 0)
    {
        return value;
    }
    
    Console.WriteLine($"Invalid input. Using default value: {defaultValue}");
    return defaultValue;
}
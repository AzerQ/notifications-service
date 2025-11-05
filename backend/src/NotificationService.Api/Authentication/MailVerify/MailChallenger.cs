using System.Security.Cryptography;
using Microsoft.Extensions.Caching.Memory;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Authentication.MailVerify;

/// <summary>
/// Реализует сервис аутентификации по электронной почте.
/// </summary>
/// <remarks>
/// Этот класс управляет процессом аутентификации пользователей через отправку кодов подтверждения
/// на их адреса электронной почты. Использует кэш в памяти для хранения активных задач аутентификации
/// и поддерживает ограничение на количество попыток ввода кода.
/// </remarks>
public class MailChallenger(IMemoryCache memoryCache, IEmailProvider mailProvider, IUserRepository userRepository) : IMailChallenger
{
  /// <summary>
  /// Максимальное количество попыток ввода кода подтверждения перед блокировкой задачи.
  /// </summary>
  public const int MaxTryCount = 3;

  /// <summary>
  /// Время жизни задачи аутентификации в минутах.
  /// </summary>
  /// <remarks>
  /// После истечения этого времени задача автоматически удаляется из кэша.
  /// </remarks>
  public const int ChallengeTtlInMinutes = 10;

  /// <summary>
  /// Генерирует случайный шестизначный код подтверждения.
  /// </summary>
  /// <returns>Строка, содержащая шестизначный числовой код.</returns>
  /// <remarks>
  /// Использует криптографически стойкий генератор случайных чисел для обеспечения безопасности.
  /// Код всегда форматируется с ведущими нулями для обеспечения длины в 6 символов.
  /// </remarks>
  public string GenerateCode() => RandomNumberGenerator.GetInt32(1000, 1_000_000).ToString("D6");

  /// <inheritdoc/>
  public async Task<CreatedMailChallengeResponse> GenerateMailChallenge(string email)
  {
    User? user = await userRepository.GetUserByEmailAsync(email);

    if (user is null)
      throw new NullReferenceException($"User with email {email} doesn't exists");

    MailChallenge mailChallenge = new (id: Guid.NewGuid(), code: GenerateCode(), email: email);
    bool emailSendedSuccessfully = await mailProvider.SendEmailAsync(email, "Verify your identity for notifications system", $"Your code is {mailChallenge.Code}");
    if (!emailSendedSuccessfully) {
      throw new Exception("Can't send email (See application logs for details)");
    }
    memoryCache.Set(mailChallenge.Id, mailChallenge, TimeSpan.FromMinutes(ChallengeTtlInMinutes));
    return new CreatedMailChallengeResponse(mailChallenge.Id, $"Check your mailbox ({email}) and enter code");
  }

  /// <inheritdoc/>
  public async Task<MailVerifyResponse> VerifyMailChallengeAnswer(MailChallengeSubmit mailChallengeSubmit)
  {
    var mailChallenge = memoryCache.Get<MailChallenge>(mailChallengeSubmit.Id);
      
    if (mailChallenge is null)
      return new MailVerifyResponse(false, $"Can't find mail challenge by id (Maybe {ChallengeTtlInMinutes} minutes timeout expired)", null);

    if (mailChallenge.TryCounts >= MaxTryCount) {
      memoryCache.Remove(mailChallengeSubmit.Id);
      return new MailVerifyResponse(false, "Try counts reached, please generate new code again!", null);
    }

    bool isValidCode = mailChallengeSubmit.Code == mailChallenge.Code;

    if (!isValidCode) {
      mailChallenge.TryCounts++;
      return new MailVerifyResponse(false, "Incorrect code", null);
    }

    User user = (await userRepository.GetUserByEmailAsync(mailChallenge.Email))!;
    return new MailVerifyResponse(true, "User validate successfully", user);

  }
}
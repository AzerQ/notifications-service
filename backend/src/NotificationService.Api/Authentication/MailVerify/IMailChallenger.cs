using NotificationService.Domain.Models;

namespace NotificationService.Api.Authentication.MailVerify;

/// <summary>
/// Определяет интерфейс для сервиса аутентификации по электронной почте.
/// </summary>
/// <remarks>
/// Этот интерфейс предоставляет методы для генерации задач аутентификации по электронной почте
/// и проверки ответов пользователя на эти задачи.
/// </remarks>
public interface IMailChallenger
{
   /// <summary>
   /// Генерирует новую задачу аутентификации по электронной почте для указанного пользователя.
   /// </summary>
   /// <param name="email">Адрес электронной почты пользователя, для которого генерируется задача.</param>
   /// <returns>
   /// Кортеж, содержащий:
   /// <list type="bullet">
   /// <item><description>id - уникальный идентификатор созданной задачи</description></item>
   /// <item><description>message - сообщение для пользователя с инструкциями</description></item>
   /// </list>
   /// </returns>
   /// <exception cref="NullReferenceException">Выбрасывается, если пользователь с указанным email не найден.</exception>
   /// <remarks>
   /// Метод отправляет код подтверждения на указанный адрес электронной почты
   /// и кэширует задачу на время, определенное константой <see cref="MailChallenger.ChallengeTtlInMinutes"/>.
   /// </remarks>
   Task<CreatedMailChallengeResponse> GenerateMailChallenge(string email);

   /// <summary>
   /// Проверяет ответ пользователя на задачу аутентификации по электронной почте.
   /// </summary>
   /// <param name="mailChallengeSubmit">Объект, содержащий идентификатор задачи и код подтверждения, введенный пользователем.</param>
   /// <returns>
   /// Кортеж, содержащий:
   /// <list type="bullet">
   /// <item><description>isValid - флаг, указывающий, является ли ответ корректным</description></item>
   /// <item><description>Message - сообщение о результате проверки</description></item>
   /// <item><description>user - объект пользователя, если проверка успешна; иначе null</description></item>
   /// </list>
   /// </returns>
   /// <remarks>
   /// Метод проверяет:
   /// <list type="bullet">
   /// <item><description>Существование задачи в кэше</description></item>
   /// <item><description>Не превышено ли максимальное количество попыток</description></item>
   /// <item><description>Соответствие введенного кода сохраненному коду</description></item>
   /// </list>
   /// </remarks>
   Task<MailVerifyResponse> VerifyMailChallengeAnswer(MailChallengeSubmit mailChallengeSubmit);
}
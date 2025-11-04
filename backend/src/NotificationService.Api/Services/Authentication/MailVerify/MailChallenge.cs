namespace NotificationService.Api.Services.Authentication.MailVerify;

/// <summary>
/// Представляет задачу аутентификации по электронной почте с кодом подтверждения.
/// </summary>
/// <remarks>
/// Этот класс используется для хранения информации о вызове аутентификации по электронной почте,
/// включая уникальный идентификатор, код подтверждения, адрес электронной почты и количество попыток.
/// Поддерживает деконструкцию для удобного распаковки значений.
/// </remarks>
public class MailChallenge(Guid id, string code, string email , string message = "", int tryCounts = 0)
{
  /// <summary>
  /// Получает уникальный идентификатор задачи аутентификации.
  /// </summary>
  /// <value>GUID, который однозначно идентифицирует эту задачу аутентификации.</value>
  public Guid Id { get; init; } = id;

  /// <summary>
  /// Получает код подтверждения, отправленный пользователю по электронной почте.
  /// </summary>
  /// <value>Шестизначный числовой код в виде строки.</value>
  public string Code { get; init; } = code;

  /// <summary>
  /// Получает адрес электронной почты пользователя, для которого создана задача аутентификации.
  /// </summary>
  /// <value>Адрес электронной почты пользователя.</value>
  public string Email { get; init; } = email;

  /// <summary>
  /// Получает сообщение, связанное с задачей аутентификации.
  /// </summary>
  /// <value>Описательное сообщение для пользователя. По умолчанию пустая строка.</value>
  public string Message { get; init; } = message;

  /// <summary>
  /// Получает или устанавливает количество неудачных попыток ввода кода.
  /// </summary>
  /// <value>Количество попыток, которые пользователь сделал для ввода кода. По умолчанию 0.</value>
  public int TryCounts { get; set; } = tryCounts;

  /// <summary>
  /// Деконструирует объект <see cref="MailChallenge"/> на его составные части.
  /// </summary>
  /// <param name="id">Выходной параметр для уникального идентификатора задачи.</param>
  /// <param name="code">Выходной параметр для кода подтверждения.</param>
  /// <param name="email">Выходной параметр для адреса электронной почты.</param>
  /// <param name="message">Выходной параметр для сообщения задачи.</param>
  /// <param name="tryCounts">Выходной параметр для количества попыток.</param>
  /// <example>
  /// <code>
  /// var (id, code, email, message, tryCounts) = mailChallenge;
  /// </code>
  /// </example>
  public void Deconstruct(out Guid id, out string code, out string email , out string message, out int tryCounts)
  {
    id = this.Id;
    code = this.Code;
    email = this.Email;
    message = this.Message;
    tryCounts = this.TryCounts;
  }
}
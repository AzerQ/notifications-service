namespace NotificationService.Api.Authentication.MailVerify;

/// <summary>
/// Представляет данные для отправки ответа на задачу аутентификации по электронной почте.
/// </summary>
/// <remarks>
/// Этот record используется для передачи идентификатора задачи и кода подтверждения,
/// введенного пользователем, на сервер для проверки.
/// </remarks>
/// <param name="Id">Уникальный идентификатор задачи аутентификации, полученный при генерации кода.</param>
/// <param name="Code">Код подтверждения, введенный пользователем.</param>
public record MailChallengeSubmit(Guid Id, string Code);
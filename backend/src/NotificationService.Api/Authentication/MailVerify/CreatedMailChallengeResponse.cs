namespace NotificationService.Api.Authentication.MailVerify;

public record CreatedMailChallengeResponse(Guid ChallengeId, string Message = "");
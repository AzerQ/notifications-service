namespace NotificationService.Api.Services.Authentication.MailVerify;

public record CreatedMailChallengeResponse(Guid ChallengeId, string Message = "");
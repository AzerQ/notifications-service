namespace NotificationService.Api.Services.Authentication;

public record LoginTokenResponse(string RefreshToken, string AccessToken);

public record AccessTokenResponse(string AccessToken);
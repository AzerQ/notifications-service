namespace NotificationService.Api.Authentication.Models;

public record LoginTokensResponse(string RefreshToken, string AccessToken);

using System.Text.Json.Serialization;

namespace NotificationService.Api.Authentication.Models;

public record LoginTokensResponse(
    [property: JsonPropertyName("refreshToken")] string RefreshToken, 
    [property: JsonPropertyName("accessToken")] string AccessToken
);

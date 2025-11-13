using System.Text.Json.Serialization;

namespace NotificationService.Api.Authentication.Models;

public record AccessTokenResponse(
    [property: JsonPropertyName("accessToken")] string AccessToken
);
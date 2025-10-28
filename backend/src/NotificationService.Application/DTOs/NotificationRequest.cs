using Microsoft.AspNetCore.Mvc;
using NotificationService.Domain.Models;
using System.Text.Json;

namespace NotificationService.Application.DTOs;

public class NotificationRequest
{
    [FromQuery]
    public string? Title { get; set; }

    [FromQuery]
    public string? Message { get; set; }

    [FromRoute(Name = "route")]
    public required string Route { get; set; }

    [FromQuery]
    public NotificationChannel[]? Channels { get; set; }

    [FromBody]
    public required JsonElement Parameters { get; set; }

    private static readonly JsonSerializerOptions JsonSerializerOptions = new () {
                PropertyNameCaseInsensitive = true
    };

    public T? GetData<T>() => Parameters.Deserialize<T>(JsonSerializerOptions);
}
using System.Net;
using System.Text.Json;

namespace NotificationService.Api;

/// <summary>
/// Промежуточное ПО для обработки ошибок во время выполнения запроса
/// </summary>
public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = exception switch
        {
            UnauthorizedAccessException _ => HttpStatusCode.Unauthorized,
            KeyNotFoundException _ => HttpStatusCode.NotFound,
            _ => HttpStatusCode.InternalServerError
        };

        var result = JsonSerializer.Serialize(new { message = exception.Message });
        context.Response.StatusCode = (int)code;
        await context.Response.WriteAsJsonAsync(result);
    }
}

// Класс для расширения, чтобы удобно добавить middleware в pipeline
public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ErrorHandlingMiddleware>();
    }
}

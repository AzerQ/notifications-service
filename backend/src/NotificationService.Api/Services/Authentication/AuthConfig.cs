using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace NotificationService.Api.Services.Authentication;

public static class AuthConfig
{
    public static IServiceCollection ConfigureServiceAuthentication(this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure JWT authentication
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];

        if (string.IsNullOrWhiteSpace(secretKey))
            throw new Exception("JwtSettings:SecretKey must be defined in configuration!");


        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"] ?? "NotificationService",
                    ValidAudience = jwtSettings["Audience"] ?? "NotificationServiceClients",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };

                // Allow JWT token in query string for SignalR
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            })
            .AddNegotiate();

        services.AddAuthorizationBuilder()
            .AddPolicy(WindowsAuthPolicyName, policy =>
                    policy.RequireAuthenticatedUser().AddAuthenticationSchemes("Negotiate"))
            .AddPolicy(JwtAuthPolicyName, policy =>
                    policy.RequireAuthenticatedUser().AddAuthenticationSchemes("JwtBearer"));

        return services;
    }

    public const string WindowsAuthPolicyName = "WindowsAuth";

    public const string JwtAuthPolicyName = "JWT";
}
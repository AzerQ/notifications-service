using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using NotificationService.Api;
using NotificationService.Api.DI;
using NotificationService.Api.Hubs;
using NotificationService.Api.Providers;
using NotificationService.Api.Services;
using NotificationService.Application.Extensions;
using NotificationService.Infrastructure.Data.Init;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerWithXmlDocumentation();

builder.Services.AddNotificationApplicationServices(builder.Configuration);

// Register authentication services
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure JWT authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";

builder.Services.AddAuthentication(options =>
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
});

builder.Services.AddAuthorization();

// Configure SignalR with custom UserIdProvider for targeted notifications
builder.Services.AddSingleton<IUserIdProvider, UserIdProvider>();

// Register test notification handlers
builder.Services.AddNotificationsServiceModule(builder.Configuration, 
    typeof(NotificationService.TestHandlers.NotificationServicesRegister).Assembly);

var app = builder.Build();

bool enableSwaggerUI = builder.Configuration.GetValue<bool>("EnableSwaggerUI");
// Configure the HTTP request pipeline.
if (enableSwaggerUI)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHsts();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

app.UseMiddleware<ErrorHandlingMiddleware>();

// Apply migrations and seed initial data
await DbInitializer.InitializeAsync(app.Services, app.Configuration, app.Environment.IsProduction());

app.Run();

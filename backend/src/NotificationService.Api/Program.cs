using NotificationService.Api;
using NotificationService.Api.Authentication;
using NotificationService.Api.DI;
using NotificationService.Api.Hubs;
using NotificationService.Application.Extensions;
using NotificationService.Infrastructure.Data.Init;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddNotificationApplicationServices(builder.Configuration);
builder.Services.ConfigureServiceAuthentication(builder.Configuration);

// Register test notification handlers
builder.Services.AddNotificationsServiceModules(builder.Configuration, 
    typeof(NotificationService.TestHandlers.NotificationsModuleServicesRegister).Assembly);

builder.Configuration.AddJsonFile("serilog.config.json", optional: false);
Log.Logger = new LoggerConfiguration()
    .ReadFrom
    .Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

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
await ServiceInitializer.InitializeAsync(app.Services, app.Configuration, app.Environment.IsProduction());

app.Run();

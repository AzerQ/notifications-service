using Microsoft.AspNetCore.SignalR;
using NotificationService.Api;
using NotificationService.Api.Authentication;
using NotificationService.Api.Configuration;
using NotificationService.Api.DI;
using NotificationService.Api.Hubs;
using NotificationService.Api.Jobs;
using NotificationService.Api.Providers;
using NotificationService.Application.Extensions;
using NotificationService.Infrastructure.Data.Init;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerWithXmlDocumentation();

builder.Services.AddNotificationApplicationServices(builder.Configuration);

builder.Services.ConfigureServiceAuthentication(builder.Configuration);

// Configure notification cleanup options
builder.Services.Configure<NotificationCleanupOptions>(
    builder.Configuration.GetSection("NotificationCleanup"));

// Configure Quartz for scheduled jobs
builder.Services.AddQuartz(q =>
{
    var cleanupOptions = builder.Configuration.GetSection("NotificationCleanup").Get<NotificationCleanupOptions>() 
        ?? new NotificationCleanupOptions();
    
    if (cleanupOptions.Enabled)
    {
        var jobKey = new JobKey("NotificationCleanupJob");
        q.AddJob<NotificationCleanupJob>(opts => opts.WithIdentity(jobKey));
        
        q.AddTrigger(opts => opts
            .ForJob(jobKey)
            .WithIdentity("NotificationCleanupJob-trigger")
            .WithCronSchedule(cleanupOptions.Schedule)
            .WithDescription($"Cleans up notifications older than {cleanupOptions.RetentionDays} days"));
    }
});

builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

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

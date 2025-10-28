using NotificationService.Api;
using NotificationService.Api.DI;
using NotificationService.Api.Hubs;
using NotificationService.Application.Extensions;
using NotificationService.Infrastructure.Data.Init;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerWithXmlDocumentation();

builder.Services.AddNotificationApplicationServices(builder.Configuration);

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

app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

app.UseMiddleware<ErrorHandlingMiddleware>();

// Apply migrations and seed initial data
await DbInitializer.InitializeAsync(app.Services, app.Configuration, app.Environment.IsProduction());

app.Run();

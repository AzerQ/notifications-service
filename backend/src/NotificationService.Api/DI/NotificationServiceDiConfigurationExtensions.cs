using EF.DynamicFilters;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using NotificationService.Api.SwaggerExtensions;
using NotificationService.Api.Hubs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Mappers;
using NotificationService.Application.Services;
using NotificationService.Domain.Interfaces;
using NotificationService.Infrastructure.Data;
using NotificationService.Infrastructure.Providers.Email;
using NotificationService.Infrastructure.Repositories;
using NotificationService.Infrastructure.Templates;

namespace NotificationService.Api.DI;

public static class NotificationServiceDiConfigurationExtensions
{
    public static IServiceCollection AddSwaggerWithXmlDocumentation(this IServiceCollection services)
    {
        return services
            .AddEndpointsApiExplorer()
            .AddSwaggerGen((options) =>
            {
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath);
                }

                options.DocumentFilter<NotificationDocumentFilter>();

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme."
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
    }

    public static IServiceCollection AddApplicationCorsSettings(this IServiceCollection services,
        IConfiguration configuration)
    {
        return services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                var originsSection = configuration.GetSection("CORS:AllowedOrigins");
                var origins = originsSection.Get<string[]>() ?? ["*"];
                policy.WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();

                bool allowCredentials = bool.Parse(configuration["CORS:AllowCredentials"] ?? bool.FalseString);
                if (allowCredentials)
                    policy.AllowCredentials();
            });
        });
    }

    public static IServiceCollection AddPersistenceServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        return services.AddDbContext<NotificationDbContext>
                (options =>
                        options.UseSqlite(
                            configuration
                                .GetConnectionString(
                                    "Notifications")) // , b =>  b.MigrationsAssembly("NotificationService.Api")
                    , ServiceLifetime.Singleton)
                .AddSingleton<INotificationRepository, NotificationRepository>()
                .AddSingleton<IUserRepository, UserRepository>()
                .AddSingleton<ITemplateRepository, TemplateRepository>()
                .AddSingleton<IUserRoutePreferenceRepository, UserRoutePreferenceRepository>()
                .AddScoped<IQueryBuilder, QueryBuilder>();
    }

    public static IServiceCollection ConfigureApplicationOptions(this IServiceCollection services,
        IConfiguration configuration)
    {
        return services
            .Configure<EmailProviderOptions>(configuration.GetSection("Email"))
            .Configure<TemplateOptions>(configuration.GetSection("Templates"))
            .AddSingleton(sp => sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<TemplateOptions>>().Value);
    }

    public static IServiceCollection AddNotificationApplicationCommonServices(this IServiceCollection services)
    {
        return services
            .AddScoped<INotificationMapper, NotificationMapper>()
            .AddSingleton<InAppNotificationMapper>()
            .AddScoped<INotificationSender, NotificationSender>()
            .AddScoped<IInAppNotificationSender, SignalRNotificationSender>()
            .AddScoped<INotificationCommandService, NotificationCommandService>()
            .AddScoped<INotificationQueryService, NotificationQueryService>()
            .AddScoped<InAppNotificationProcessor>()
            .AddSingleton<IEmailProvider, SmtpEmailProvider>()
            .AddSingleton<ISmtpClientFactory, SmtpClientFactory>()
            .AddScoped<ITemplateLoader, FileSystemTemplateLoader>()
            .AddScoped<ITemplateRenderer, HandlebarsTemplateRenderer>();
    }

    public static IServiceCollection AddNotificationApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSignalR();
        return
            services
                .AddApplicationCorsSettings(configuration)
                .AddMemoryCache()
                .ConfigureApplicationOptions(configuration)
                .AddPersistenceServices(configuration)
                .AddNotificationApplicationCommonServices();
    }
}
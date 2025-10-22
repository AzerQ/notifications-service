using Microsoft.OpenApi.Models;
using NotificationService.Application;
using NotificationService.Domain.Interfaces;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace NotificationService.Api.SwaggerExtensions;

public class NotificationDocumentFilter(NotificationRoutesContext notificationRoutesContext) : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var notificationsRoutesConfigurations = notificationRoutesContext
            .GetAllNotificationRouteConfigurations();

        foreach (var notificationRouteConfiguration in notificationsRoutesConfigurations)
        {
            AddNotificationEndpoint(swaggerDoc, context, notificationRouteConfiguration);
        }
    }

    private void AddNotificationEndpoint(OpenApiDocument swaggerDoc, DocumentFilterContext context,
        INotificationRouteConfiguration notificationRouteConfiguration)
    {
        string objectKind = notificationRouteConfiguration.NotificationObjectKind.Name;
        string notificationRoute = notificationRouteConfiguration.Name;

        var path = $"/api/Notification/{objectKind}/{notificationRoute}";
        var pathItem = new OpenApiPathItem();

        var operation = new OpenApiOperation
        {
            Tags = [new OpenApiTag { Name = objectKind }],
            Summary = notificationRouteConfiguration.DisplayName,
            Description = notificationRouteConfiguration.Description,
            Responses = new OpenApiResponses
            {
                ["200"] = new OpenApiResponse { Description = "Success" },
                ["400"] = new OpenApiResponse { Description = "Bad Request" }
            }
        };

        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new OpenApiMediaType
                {
                    Schema = context.SchemaGenerator.GenerateSchema(notificationRouteConfiguration.PayloadType,
                        context.SchemaRepository)
                }
            },
            Required = true
        };


        pathItem.Operations[OperationType.Post] = operation;
        swaggerDoc.Paths.Add(path, pathItem);
    }
}
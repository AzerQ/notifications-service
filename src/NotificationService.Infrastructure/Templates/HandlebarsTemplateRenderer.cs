using System.Text.Json;
using HandlebarsDotNet;
using HandlebarsDotNet.Extension.Json;
using Microsoft.Extensions.Logging;
using NotificationService.Application.Interfaces;

namespace NotificationService.Infrastructure.Templates;

public class HandlebarsTemplateRenderer(ILogger<HandlebarsTemplateRenderer> logger) : ITemplateRenderer
{
    private static IHandlebars WithHelpers(IHandlebars handlebars)
    {
        return RegisterFormatDataHelper(handlebars);
    }
    
    private static IHandlebars RegisterFormatDataHelper(IHandlebars handlebars)
    {
        handlebars.RegisterHelper("formatDate", (output, context, arguments) =>
        {
            if (arguments.Length < 2 ||
                arguments[0] is not DateTime date ||
                arguments[1] is not string formatString)
            {
                output.WriteSafeString(string.Empty); // Or handle error appropriately
                return;
            }

            output.WriteSafeString(date.ToString(formatString));
        });
        return handlebars;
    }
    
    public string Render(string template, object data)
    {
        if (string.IsNullOrWhiteSpace(template)) return string.Empty;

        try
        {
            var handlebars = WithHelpers(Handlebars.Create());
            var compiledTemplate = handlebars.Compile(template);
            return compiledTemplate(data);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Template rendering failed");
            throw new InvalidOperationException("Template rendering failed", ex);
        }
    }
}

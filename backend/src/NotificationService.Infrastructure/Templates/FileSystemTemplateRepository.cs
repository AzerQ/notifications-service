using System.Text.Json;
using Microsoft.Extensions.Logging;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Infrastructure.Templates;


public class FileSystemTemplateRepository : ITemplateRepository
{

    private readonly ILogger<FileSystemTemplateRepository> _logger;

    private readonly Dictionary<string, NotificationTemplate> _templates;

    public FileSystemTemplateRepository(TemplateOptions options, ILogger<FileSystemTemplateRepository> logger)
    {
        _logger = logger;
        string rootPath = string.IsNullOrWhiteSpace(options.RootPath) ? "Notifications" : options.RootPath;
        _templates = LoadTemplatesFromFileSystem(rootPath)
            .ToDictionary(t => t.Name, t => t);
    }

    private NotificationTemplate? LoadTemplateFromFolder(string folderPath)
    {
        string templateConfigFilePath = Path.Combine(folderPath, "template.json");
        string configContent = File.ReadAllText(templateConfigFilePath);

         _logger.LogInformation("Loaded config {Path} with content {Content}", templateConfigFilePath, configContent);

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var notificationTemplate = JsonSerializer.Deserialize<NotificationTemplate>(configContent, options);

        if (notificationTemplate == null)
            return null;

        notificationTemplate.CreatedAt = File.GetCreationTime(templateConfigFilePath);
        notificationTemplate.UpdatedAt = File.GetLastWriteTime(templateConfigFilePath);

        foreach (var channelTemplate in notificationTemplate.ChannelsTemplates)
        {
            string? filePath = channelTemplate.FilePath;
            if (!string.IsNullOrWhiteSpace(filePath)) {
                string templateContentPath = Path.Combine(folderPath, filePath);
                channelTemplate.Content = File.ReadAllText(templateContentPath);
            }
        }    
        
        return notificationTemplate;
    }

    private IEnumerable<NotificationTemplate> LoadTemplatesFromFileSystem(string rootPath)
    {
        return Directory
            .GetDirectories(rootPath)
            .Select(LoadTemplateFromFolder)
            .Where(template => template != null)!;
        
    }

    public bool IsTemplateExists(string name)
    {
        return _templates.ContainsKey(name);
    }

    public NotificationTemplate? GetTemplateByName(string name)
    {
        return _templates.GetValueOrDefault(name);
    }

    public void CreateTemplate(NotificationTemplate template)
    {
        _templates[template.Name] = template;
    }

    public void UpdateTemplate(NotificationTemplate template)
    {
        _templates[template.Name] = template;
    }
}

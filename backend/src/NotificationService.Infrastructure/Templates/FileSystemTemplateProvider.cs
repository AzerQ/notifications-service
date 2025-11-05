using System.Text.Json;
using Microsoft.Extensions.Logging;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Infrastructure.Templates;

public interface ITemplateLoader
{
    Task LoadTemplatesAsync();
}

public class FileSystemTemplateLoader : ITemplateLoader
{
    private readonly string _rootPath;
    private readonly ILogger<FileSystemTemplateLoader> _logger;
    private readonly ITemplateRepository _templateRepository;

    public FileSystemTemplateLoader(TemplateOptions options, ILogger<FileSystemTemplateLoader> logger, ITemplateRepository templateRepository)
    {
        ArgumentNullException.ThrowIfNull(templateRepository, nameof(templateRepository));
        _templateRepository = templateRepository;
        _rootPath = string.IsNullOrWhiteSpace(options.RootPath) ? "Notifications" : options.RootPath;
        _logger = logger;
    }

    NotificationTemplate? LoadFromFolder(string folderPath)
    {
        string templateConfigFilePath = Path.Combine(folderPath, "template.json");
        var notificationTemplate = JsonSerializer.Deserialize<NotificationTemplate>(File.ReadAllText(templateConfigFilePath));
        
        if (notificationTemplate == null)
            return null;
        
        string templateContentPath = Path.Combine(folderPath, notificationTemplate.FilePath);
        
        notificationTemplate.Content = File.ReadAllText(templateContentPath);
        
        return notificationTemplate;
    }
    public IEnumerable<NotificationTemplate> LoadTemplatesFromFileSystem(string rootPath)
    {
        return Directory
            .GetDirectories(rootPath)
            .Select(LoadFromFolder)
            .Where(f => f != null)!;
        
    }

    public async Task LoadTemplatesAsync()
    {
        var templates = LoadTemplatesFromFileSystem(_rootPath);
        foreach (var template in templates)
        {
            bool isTemplateAlreadyExists = await _templateRepository.IsTemplateExistsAsync(template.Name);
            if (!isTemplateAlreadyExists)
            {
                template.CreatedAt = DateTime.UtcNow;
                template.UpdatedAt = template.CreatedAt;
                await _templateRepository.CreateTemplateAsync(template);
            }
            else
            {
                template.UpdatedAt = DateTime.UtcNow;
                await _templateRepository.UpdateTemplateAsync(template);
            }
        }
    }
    
    public async Task<string?> GetTemplateContentAsync(string name, string extension = ".hbs", CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(name)) return null;

        var file = Path.Combine(_rootPath, name + extension);
        if (!File.Exists(file))
        {
            _logger.LogWarning("Template file not found: {File}", file);
            return null;
        }

        return await File.ReadAllTextAsync(file, ct);
    }
}

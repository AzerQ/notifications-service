using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Repositories;

public class TemplateRepository : ITemplateRepository
{
    private readonly NotificationDbContext _context;
    
    public TemplateRepository(NotificationDbContext context)
    {
        _context = context;
    }
    
    public async Task<bool> IsTemplateExistsAsync(string name) => await _context.Templates.AnyAsync(x => x.Name == name);

    public async Task<NotificationTemplate?> GetTemplateByNameAsync(string name)
    {
        return await _context.Templates.FirstOrDefaultAsync(t => t.Name == name);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetTemplatesByChannelAsync(NotificationChannel channel)
    {
        return await _context.Templates.Where(t => t.Channel == channel).ToListAsync();
    }

    public async Task<NotificationTemplate> CreateTemplateAsync(NotificationTemplate template)
    {
        ArgumentNullException.ThrowIfNull(template);

        await _context.Templates.AddAsync(template);
        await _context.SaveChangesAsync();
        return template;
    }

    public async Task UpdateTemplateAsync(NotificationTemplate template)
    {
        ArgumentNullException.ThrowIfNull(template);

        _context.Templates.Update(template);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteTemplateAsync(Guid id)
    {
        var template = await _context.Templates.FindAsync(id);
        if (template is null)
        {
            return;
        }

        _context.Templates.Remove(template);
        await _context.SaveChangesAsync();
    }
}

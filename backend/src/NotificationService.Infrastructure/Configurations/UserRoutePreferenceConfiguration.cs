using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Domain.Models;

namespace NotificationService.Infrastructure.Configurations;

public class UserRoutePreferenceConfiguration : IEntityTypeConfiguration<UserRoutePreference>
{
    public void Configure(EntityTypeBuilder<UserRoutePreference> builder)
    {
        builder.ToTable("UserRoutePreferences");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Route)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Enabled)
            .IsRequired();

        builder.HasIndex(x => new { x.UserId, x.Route }).IsUnique();
    }
}

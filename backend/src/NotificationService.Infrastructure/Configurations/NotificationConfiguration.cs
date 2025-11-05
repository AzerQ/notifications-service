using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Domain.Models;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Message)
            .HasMaxLength(4000);

        builder.Property(x => x.Route)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.Recipient)
            .WithMany()
            .HasForeignKey("RecipientId")
            .IsRequired();

        builder.Property(x => x.TemplateData)
        .HasJsonConversion();

        builder.HasOne(x => x.Template)
            .WithMany()
            .HasForeignKey("TemplateId")
            .IsRequired(false);
    }
}

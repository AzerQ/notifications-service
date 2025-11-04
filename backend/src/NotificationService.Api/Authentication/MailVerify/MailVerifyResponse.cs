using NotificationService.Domain.Models;

namespace NotificationService.Api.Authentication.MailVerify
{
    public record MailVerifyResponse(bool IsValid, string Message, User? User);
}

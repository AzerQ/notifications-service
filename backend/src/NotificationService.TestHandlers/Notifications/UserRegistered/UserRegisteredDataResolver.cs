using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.TestHandlers.Notifications.UserRegistered;

public class UserRegisteredDataResolver : INotificationDataResolver
{
    private readonly IUserRepository _userRepository;

    public UserRegisteredDataResolver(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public string Route => "UserRegistered";

    public async Task<IEnumerable<User>> ResolveNotificationRecipients(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<UserRegisteredRequestData>();
        
        if (parameters?.UserId == null)
        {
            return Enumerable.Empty<User>();
        }

        var user = await _userRepository.GetUserByIdAsync(parameters.UserId);
        return user != null ? new[] { user } : Enumerable.Empty<User>();
    }

    public async Task<object> ResolveNotificationFullData(NotificationRequest notificationRequest)
    {
        var parameters = notificationRequest.GetData<UserRegisteredRequestData>();
        if (parameters?.UserId == null)
        {
            throw new ArgumentException("UserId is required");
        }

        var user = await _userRepository.GetUserByIdAsync(parameters.UserId);
        
        if (user == null)
        {
            throw new ArgumentException($"User with ID {parameters.UserId} not found");
        }

        return new UserRegisteredTemplateModel
        {
            UserName = user.Name,
            UserEmail = user.Email,
            RegistrationDate = DateTime.Now,
            WelcomeMessage = parameters.WelcomeMessage ?? "Welcome to our service!"
        };
    }
}

public class UserRegisteredRequestData
{
    public Guid UserId { get; set; }
    public string? WelcomeMessage { get; set; }
}

public class UserRegisteredTemplateModel
{
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public string WelcomeMessage { get; set; } = string.Empty;
}

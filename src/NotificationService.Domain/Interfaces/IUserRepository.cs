using NotificationService.Domain.Models;

namespace NotificationService.Domain.Interfaces;

public interface IUserRepository: IUserReadOnlyRepository
{
    Task<User> CreateUserAsync(User user);
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(Guid id);
}

public interface IUserReadOnlyRepository
{
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllUsersAsync();
}
using DocsvisionWebClientApi.ExtendedApi.DB.Employee;
using NotificationService.Domain.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Docsvision.Services;

public class DocsvsionUserRepository (IEmployeeExtendedDataService extendedDataService) : IUserReadOnlyRepository
{
    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        var employee = await extendedDataService.GetEmployeeExtendedModelByIdAsync(id);
        // ReSharper disable once ConditionIsAlwaysTrueOrFalseAccordingToNullableAPIContract
        return employee is null ? null : DocsvisionEmployeeService.MapEmployeeToUser(employee);
    }
    
    public async Task<User?> GetUserByEmailAsync(string email)
    {
        var allUsers = await GetAllUsersAsync();
        return allUsers.FirstOrDefault(u => u.Email == email);
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        var employees = await extendedDataService.GetAllEmployees();
        return employees.Select(DocsvisionEmployeeService.MapEmployeeToUser);
    }
}
using DocsvisionWebClientApi.ExtendedApi.DB.Employee;
using NotificationService.Domain.Models;

namespace NotificationService.Docsvision.Services;

public record EmployeeWithDeputies(EmployeeExtendedModel Employee, IEnumerable<EmployeeExtendedModel> Deputies);

public class DocsvisionEmployeeService(IEmployeeExtendedDataService extendedDataService)
{
    
    public static User MapEmployeeToUser(EmployeeExtendedModel employeeModel)
    {
        if (employeeModel.Email is null)
        {
            throw new NullReferenceException("Docsvision employee Email is null");
        }

        return new User
        {
            Email = employeeModel.Email,
            Id = employeeModel.Id ?? Guid.NewGuid(),
            Name = employeeModel.DisplayString,
            CreatedAt = new DateTime(),
            PhoneNumber = employeeModel.MobilePhone,
            DeviceToken = null
        };
    }
    
    public async Task<IEnumerable<User>> GetDocsvisionUserWithDeputiesAsync(Guid employeeId)
    {
        var employeeWithDeputies = (await GetEmployeesWithDeputiesAsync(employeeId))
            .FirstOrDefault();
        
        IEnumerable<EmployeeExtendedModel> allEmployees = employeeWithDeputies is null ? [] :
            [employeeWithDeputies.Employee, .. employeeWithDeputies.Deputies];
        return allEmployees.Select(MapEmployeeToUser);
    }
    
    public async Task<IEnumerable<EmployeeWithDeputies>> GetEmployeesWithDeputiesAsync(params Guid[] ids)
    {
        var allEmployees = await extendedDataService.GetAllEmployees();
        
        var employees = allEmployees
            .Where(emp => ids.Contains(emp.Id ?? Guid.Empty))
            .ToList();

        var employeeWithDeputies = (await 
            Task.WhenAll(employees.Select(emp => extendedDataService.GetAllEmployeeDeputiesAsync(emp.Id ?? Guid.Empty))))
            .Select(depList =>
            {
                var deputyIds = depList.Select(dep => dep.DeputyId).ToList();
                return new EmployeeWithDeputies(
                    Employee: employees
                        .FirstOrDefault(emp => emp.Id == depList.FirstOrDefault()?.ReplacedEmployeeId)!,
                    Deputies: employees.Where(emp => deputyIds.Contains(emp.Id ?? Guid.Empty))
                );
            });

        return employeeWithDeputies;
    }
    
    public async Task<EmployeeExtendedModel> GetEmployeeByIdAsync(Guid employeeId) => 
        await extendedDataService.GetEmployeeExtendedModelByIdAsync(employeeId);
}
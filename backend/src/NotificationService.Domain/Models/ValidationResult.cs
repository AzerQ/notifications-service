namespace NotificationService.Domain.Models;

public class ValidationResult
{
    private readonly List<string> _errors = new();

    public bool IsValid => _errors.Count == 0;
    public IReadOnlyCollection<string> Errors => _errors;

    public void AddError(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return;
        }

        _errors.Add(message);
    }
}
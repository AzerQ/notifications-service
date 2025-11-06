namespace EF.DynamicFilters.Models;

public class QueryBuilderOptions
{
    public bool ValidateFilterFields { get; set; } = false;
    public bool ValidateSortFields { get; set; } = false;
    public bool ValidateIncludes { get; set; } = false;
    public bool ThrowOnFilterError { get; set; } = false;
    public bool ThrowOnConversionError { get; set; } = false;
    public int MaxPageSize { get; set; } = 1000;
}
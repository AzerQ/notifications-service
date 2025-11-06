namespace EF.DynamicFilters.Models;

public class QueryResult<T>
{
    public List<T> Data { get; set; }
    public int? TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int? TotalPages => TotalCount.HasValue ? (int)Math.Ceiling(TotalCount.Value / (double)PageSize) : null;
}
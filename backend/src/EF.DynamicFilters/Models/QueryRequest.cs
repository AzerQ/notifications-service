namespace EF.DynamicFilters.Models;

public class QueryRequest
{
  public List<QueryFilter> Filters { get; set; } = new List<QueryFilter>();
  public List<SortOption> Sort { get; set; } = new List<SortOption>();
  public int Page { get; set; } = 1;
  public int PageSize { get; set; } = 20;
  public List<string> Includes { get; set; } = new List<string>();
    
  // Для производительности - можно отключить подсчет общего количества
  public bool IncludeTotalCount { get; set; } = true;
}
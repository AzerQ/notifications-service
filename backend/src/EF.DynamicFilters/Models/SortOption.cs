using EF.DynamicFilters.Enums;

namespace EF.DynamicFilters.Models;

public class SortOption
{
  public string Field { get; set; }
  public SortDirection Direction { get; set; } = SortDirection.Ascending;
}
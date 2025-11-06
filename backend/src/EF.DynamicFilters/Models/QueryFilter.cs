using EF.DynamicFilters.Enums;

namespace EF.DynamicFilters.Models;

public class QueryFilter
{
  public string Field { get; set; }
  public FilterOperator Operator { get; set; } = FilterOperator.Equals;
  public object Value { get; set; }
  public FilterLogic Logic { get; set; } = FilterLogic.And;
}
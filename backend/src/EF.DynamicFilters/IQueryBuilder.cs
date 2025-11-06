using EF.DynamicFilters.Models;

namespace EF.DynamicFilters;

/// <summary>
/// Defines the contract for building dynamic LINQ queries with filtering, sorting, and pagination.
/// </summary>
/// <remarks>
/// <para>
/// The IQueryBuilder interface provides a contract for implementations that construct complex
/// Entity Framework Core queries dynamically based on client requests. Implementations should support:
/// </para>
/// <list type="bullet">
/// <item><description>Eager loading of related entities</description></item>
/// <item><description>Dynamic filtering with multiple operators</description></item>
/// <item><description>Multi-field sorting</description></item>
/// <item><description>Pagination with configurable limits</description></item>
/// <item><description>Security validation of field names</description></item>
/// </list>
/// </remarks>
public interface IQueryBuilder
{
  /// <summary>
  /// Builds a queryable with includes, filters, sorting, and pagination applied.
  /// </summary>
  /// <typeparam name="T">The entity type.</typeparam>
  /// <param name="source">The source queryable to build upon.</param>
  /// <param name="request">The query request containing filters, sort options, and pagination parameters.</param>
  /// <returns>
  /// A queryable with all transformations applied. If request is null, the source queryable is returned unchanged.
  /// </returns>
  /// <remarks>
  /// The returned queryable is not materialized and can be further modified before execution.
  /// Transformations are applied in the following order: includes, filters, sorting, pagination.
  /// </remarks>
  IQueryable<T> BuildQuery<T>(IQueryable<T> source, QueryRequest request) where T : class;

  /// <summary>
  /// Builds a query result with data, pagination info, and optional total count.
  /// </summary>
  /// <typeparam name="T">The entity type.</typeparam>
  /// <param name="source">The source queryable to build upon.</param>
  /// <param name="request">The query request containing filters, sort options, and pagination parameters.</param>
  /// <returns>
  /// A <see cref="QueryResult{T}"/> containing the materialized data, pagination metadata, and optional total count.
  /// </returns>
  /// <remarks>
  /// <para>
  /// This method materializes the query and returns results in a structured format suitable for API responses.
  /// The total count is calculated before pagination if <see cref="QueryRequest.IncludeTotalCount"/> is true.
  /// </para>
  /// <para>
  /// If request is null, returns all data with default pagination (page 1, size 20).
  /// </para>
  /// </remarks>
  QueryResult<T> BuildQueryResult<T>(IQueryable<T> source, QueryRequest request) where T : class;

  /// <summary>
  /// Builds a query and returns both the queryable and total count before pagination.
  /// </summary>
  /// <typeparam name="T">The entity type.</typeparam>
  /// <param name="source">The source queryable to build upon.</param>
  /// <param name="request">The query request containing filters, sort options, and pagination parameters.</param>
  /// <returns>
  /// A tuple containing:
  /// <list type="bullet">
  /// <item><description>query: The paginated queryable (not materialized)</description></item>
  /// <item><description>totalCount: The total number of records matching the filters before pagination</description></item>
  /// </list>
  /// </returns>
  /// <remarks>
  /// <para>
  /// This method is useful when you need both the paginated results and the total count
  /// without materializing the entire result set. The total count is calculated before pagination.
  /// </para>
  /// <para>
  /// If request is null, returns the source queryable and its count.
  /// </para>
  /// </remarks>
  (IQueryable<T> query, int totalCount) BuildQueryWithCount<T>(IQueryable<T> source, QueryRequest request) where T : class;
}
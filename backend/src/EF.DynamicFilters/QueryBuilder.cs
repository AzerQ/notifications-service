using EF.DynamicFilters.Models;
using System.Linq.Expressions;
using EF.DynamicFilters.Enums;
using Microsoft.EntityFrameworkCore;
namespace EF.DynamicFilters;

/// <summary>
/// Builds dynamic LINQ queries with support for filtering, sorting, pagination, and eager loading.
/// </summary>
/// <remarks>
/// <para>
/// The QueryBuilder class provides a fluent API for constructing complex Entity Framework Core queries
/// dynamically based on client requests. It supports:
/// </para>
/// <list type="bullet">
/// <item><description>Eager loading of related entities via Include</description></item>
/// <item><description>Dynamic filtering with multiple operators (Equals, Contains, GreaterThan, etc.)</description></item>
/// <item><description>Multi-field sorting with ascending/descending directions</description></item>
/// <item><description>Pagination with configurable page size limits</description></item>
/// <item><description>Security validation of filter, sort, and include fields</description></item>
/// <item><description>Type conversion for Guid, Enum, and other types</description></item>
/// </list>
/// <para>
/// Security features include optional validation of property names to prevent injection attacks
/// and configurable error handling for conversion and filter building failures.
/// </para>
/// </remarks>
public class QueryBuilder : IQueryBuilder
{
    /// <summary>
    /// Configuration options for query building behavior and security.
    /// </summary>
    private readonly QueryBuilderOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="QueryBuilder"/> class.
    /// </summary>
    /// <param name="options">Configuration options. If null, default options are used.</param>
    public QueryBuilder(QueryBuilderOptions options = null)
    {
        _options = options ?? new QueryBuilderOptions();
    }

    /// <summary>
    /// Builds a queryable with includes, filters, sorting, and pagination applied.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="source">The source queryable.</param>
    /// <param name="request">The query request containing filters, sort options, and pagination parameters.</param>
    /// <returns>A queryable with all transformations applied.</returns>
    /// <remarks>
    /// This method applies transformations in the following order:
    /// <list type="number">
    /// <item><description>Includes (eager loading)</description></item>
    /// <item><description>Filters</description></item>
    /// <item><description>Sorting</description></item>
    /// <item><description>Pagination</description></item>
    /// </list>
    /// If request is null, the source queryable is returned unchanged.
    /// </remarks>
    public IQueryable<T> BuildQuery<T>(IQueryable<T> source, QueryRequest request) where T : class
    {
        if (request == null) return source;
        
        var query = source.AsQueryable();
        
        query = ApplyIncludes(query, request.Includes);
        query = ApplyFilters(query, request.Filters);
        query = ApplySorting(query, request.Sort);
        query = ApplyPagination(query, request.Page, request.PageSize);
        
        return query;
    }

    /// <summary>
    /// Builds a query result with data, pagination info, and optional total count.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="source">The source queryable.</param>
    /// <param name="request">The query request containing filters, sort options, and pagination parameters.</param>
    /// <returns>A <see cref="QueryResult{T}"/> containing the data and metadata.</returns>
    /// <remarks>
    /// <para>
    /// This method materializes the query and returns results in a structured format.
    /// The total count is calculated before pagination if <see cref="QueryRequest.IncludeTotalCount"/> is true.
    /// </para>
    /// <para>
    /// If request is null, returns all data with default pagination (page 1, size 20).
    /// </para>
    /// </remarks>
    public QueryResult<T> BuildQueryResult<T>(IQueryable<T> source, QueryRequest request) where T : class
    {
        if (request == null)
            return new QueryResult<T> { Data = source.ToList(), Page = 1, PageSize = 20 };
        
        var query = source.AsQueryable();
        
        query = ApplyIncludes(query, request.Includes);
        query = ApplyFilters(query, request.Filters);
        
        int? totalCount = null;
        if (request.IncludeTotalCount)
        {
            totalCount = query.Count();
        }
        
        query = ApplySorting(query, request.Sort);
        query = ApplyPagination(query, request.Page, request.PageSize);
        
        var data = query.ToList();
        
        return new QueryResult<T>
        {
            Data = data,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    /// <summary>
    /// Builds a query and returns both the queryable and total count before pagination.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="source">The source queryable.</param>
    /// <param name="request">The query request containing filters, sort options, and pagination parameters.</param>
    /// <returns>A tuple containing the paginated queryable and the total count of filtered records.</returns>
    /// <remarks>
    /// <para>
    /// This method is useful when you need both the paginated results and the total count
    /// without materializing the entire result set. The total count is calculated before pagination.
    /// </para>
    /// <para>
    /// If request is null, returns the source queryable and its count.
    /// </para>
    /// </remarks>
    public (IQueryable<T> query, int totalCount) BuildQueryWithCount<T>(IQueryable<T> source, QueryRequest request) where T : class
    {
        if (request == null) return (source, source.Count());
        
        var query = source.AsQueryable();
        
        query = ApplyIncludes(query, request.Includes);
        query = ApplyFilters(query, request.Filters);
        
        var totalCount = query.Count();
        
        query = ApplySorting(query, request.Sort);
        query = ApplyPagination(query, request.Page, request.PageSize);
        
        return (query, totalCount);
    }

    /// <summary>
    /// Applies eager loading of related entities to the query.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="query">The source queryable.</param>
    /// <param name="includes">Collection of navigation property names to include.</param>
    /// <returns>The queryable with includes applied.</returns>
    /// <remarks>
    /// <para>
    /// If <see cref="QueryBuilderOptions.ValidateIncludes"/> is enabled, only valid navigation properties
    /// (class types or collections) are included. Invalid includes are silently ignored.
    /// </para>
    /// <para>
    /// Supports nested includes using dot notation (e.g., "Orders.Items").
    /// </para>
    /// </remarks>
    private IQueryable<T> ApplyIncludes<T>(IQueryable<T> query, List<string> includes) where T : class
    {
        if (includes?.Any() != true) return query;
        
        // Проверка безопасности включений
        var validIncludes = _options.ValidateIncludes
            ? GetValidIncludes<T>(includes)
            : includes;
        
        return validIncludes.Aggregate(query, (current, include) => current.Include(include));
    }

    /// <summary>
    /// Applies dynamic filters to the query using LINQ expressions.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="query">The source queryable.</param>
    /// <param name="filters">Collection of filter specifications.</param>
    /// <returns>The queryable with filters applied.</returns>
    /// <remarks>
    /// <para>
    /// Filters are combined using AND/OR logic as specified in each filter's <see cref="QueryFilter.Logic"/> property.
    /// The first filter always uses AND logic (no previous expression to combine with).
    /// </para>
    /// <para>
    /// If <see cref="QueryBuilderOptions.ValidateFilterFields"/> is enabled, only filters on valid properties are applied.
    /// </para>
    /// <para>
    /// Supported operators: Equals, NotEquals, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual,
    /// Contains, StartsWith, EndsWith, In.
    /// </para>
    /// </remarks>
    private IQueryable<T> ApplyFilters<T>(IQueryable<T> query, List<QueryFilter> filters) where T : class
    {
        if (filters?.Any() != true) return query;
        
        // Проверка безопасности полей фильтрации
        var validFilters = _options.ValidateFilterFields
            ? GetValidFilters<T>(filters)
            : filters;
        
        if (!validFilters.Any()) return query;
        
        var parameter = Expression.Parameter(typeof(T), "x");
        Expression? combinedExpression = null;
        
        foreach (var filter in validFilters)
        {
            var expression = BuildFilterExpression(parameter, filter);
            if (expression == null) continue;
            
            var lambda = Expression.Lambda<Func<T, bool>>(expression, parameter);
            
            if (combinedExpression == null)
            {
                combinedExpression = lambda.Body;
            }
            else
            {
                combinedExpression = filter.Logic == FilterLogic.Or
                    ? Expression.OrElse(combinedExpression, lambda.Body)
                    : Expression.AndAlso(combinedExpression, lambda.Body);
            }
        }
        
        if (combinedExpression == null) return query;
        
        var finalLambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
        return query.Where(finalLambda);
    }

    /// <summary>
    /// Builds a filter expression for a single filter specification.
    /// </summary>
    /// <param name="parameter">The parameter expression representing the entity.</param>
    /// <param name="filter">The filter specification.</param>
    /// <returns>An expression tree representing the filter, or null if the filter cannot be built.</returns>
    /// <remarks>
    /// <para>
    /// This method handles type conversion, null value checks, and all supported filter operators.
    /// String methods (Contains, StartsWith, EndsWith) are translated to LINQ method calls.
    /// The "In" operator creates an OR chain of equality comparisons.
    /// </para>
    /// <para>
    /// If <see cref="QueryBuilderOptions.ThrowOnFilterError"/> is enabled, exceptions are thrown;
    /// otherwise, null is returned and the filter is skipped.
    /// </para>
    /// </remarks>
    private Expression? BuildFilterExpression(ParameterExpression parameter, QueryFilter filter)
    {
        try
        {
            var property = Expression.Property(parameter, filter.Field);
            var value = ConvertValue(property.Type, filter.Value);
            
            // Обработка null значений
            if (value == null)
            {
                return filter.Operator switch
                {
                    FilterOperator.Equals => Expression.Equal(property, Expression.Constant(null)),
                    FilterOperator.NotEquals => Expression.NotEqual(property, Expression.Constant(null)),
                    _ => null
                };
            }
            
            var constant = Expression.Constant(value);
            
            return filter.Operator switch
            {
                FilterOperator.Equals => Expression.Equal(property, constant),
                FilterOperator.NotEquals => Expression.NotEqual(property, constant),
                FilterOperator.GreaterThan => Expression.GreaterThan(property, constant),
                FilterOperator.GreaterThanOrEqual => Expression.GreaterThanOrEqual(property, constant),
                FilterOperator.LessThan => Expression.LessThan(property, constant),
                FilterOperator.LessThanOrEqual => Expression.LessThanOrEqual(property, constant),
                FilterOperator.Contains => BuildStringMethodExpression(property, value, "Contains"),
                FilterOperator.StartsWith => BuildStringMethodExpression(property, value, "StartsWith"),
                FilterOperator.EndsWith => BuildStringMethodExpression(property, value, "EndsWith"),
                FilterOperator.In => BuildInExpression(property, value),
                _ => Expression.Equal(property, constant)
            };
        }
        catch (Exception ex)
        {
            if (_options.ThrowOnFilterError)
                throw new InvalidOperationException($"Error building filter for field '{filter.Field}': {ex.Message}", ex);
            
            return null;
        }
    }

    /// <summary>
    /// Builds an expression for string method calls (Contains, StartsWith, EndsWith).
    /// </summary>
    /// <param name="property">The property expression.</param>
    /// <param name="value">The value to search for.</param>
    /// <param name="methodName">The name of the string method to call.</param>
    /// <returns>An expression representing the method call.</returns>
    /// <exception cref="InvalidOperationException">Thrown if the string method is not found.</exception>
    private Expression BuildStringMethodExpression(MemberExpression property, object value, string methodName)
    {
        var method = typeof(string).GetMethod(methodName, new[] { typeof(string) });
        if (method == null)
            throw new InvalidOperationException($"String method '{methodName}' not found");
        
        return Expression.Call(property, method, Expression.Constant(value));
    }

    /// <summary>
    /// Builds an expression for the "In" operator (checks if property value is in a collection).
    /// </summary>
    /// <param name="property">The property expression.</param>
    /// <param name="value">An enumerable collection of values to check against.</param>
    /// <returns>An expression representing the "In" check as a chain of OR comparisons.</returns>
    /// <exception cref="ArgumentException">Thrown if value is not enumerable.</exception>
    /// <remarks>
    /// The "In" operator is translated to: property == value1 || property == value2 || ...
    /// </remarks>
    private Expression BuildInExpression(MemberExpression property, object value)
    {
        if (value is not System.Collections.IEnumerable enumerable)
            throw new ArgumentException("Value for 'In' operator must be enumerable");
        
        var values = enumerable.Cast<object>().Select(v => ConvertValue(property.Type, v)).ToList();
        
        if (!values.Any())
            return Expression.Constant(false);
        
        // Создаем выражение: property == value1 || property == value2 || ...
        Expression? inExpression = null;
        foreach (var val in values)
        {
            var equalsExpression = Expression.Equal(property, Expression.Constant(val));
            inExpression = inExpression == null
                ? equalsExpression
                : Expression.OrElse(inExpression, equalsExpression);
        }
        
        return inExpression ?? Expression.Constant(false);
    }

    /// <summary>
    /// Applies sorting to the query based on sort options.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="query">The source queryable.</param>
    /// <param name="sortOptions">Collection of sort specifications in priority order.</param>
    /// <returns>The queryable with sorting applied.</returns>
    /// <remarks>
    /// <para>
    /// Sort options are applied in the order they appear in the collection.
    /// The first sort uses OrderBy/OrderByDescending, subsequent sorts use ThenBy/ThenByDescending.
    /// </para>
    /// <para>
    /// If <see cref="QueryBuilderOptions.ValidateSortFields"/> is enabled, only sorts on valid properties are applied.
    /// </para>
    /// </remarks>
    private IQueryable<T> ApplySorting<T>(IQueryable<T> query, List<SortOption> sortOptions) where T : class
    {
        if (sortOptions?.Any() != true) return query;
        
        // Проверка безопасности полей сортировки
        var validSortOptions = _options.ValidateSortFields
            ? GetValidSortOptions<T>(sortOptions)
            : sortOptions;
        
        if (!validSortOptions.Any()) return query;
        
        IOrderedQueryable<T>? orderedQuery = null;
        var isFirst = true;
        
        foreach (var sort in validSortOptions)
        {
            var lambda = CreatePropertyLambda<T, object>(sort.Field);
            
            if (isFirst)
            {
                orderedQuery = sort.Direction == SortDirection.Ascending
                    ? query.OrderBy(lambda)
                    : query.OrderByDescending(lambda);
                isFirst = false;
            }
            else
            {
                orderedQuery = sort.Direction == SortDirection.Ascending
                    ? orderedQuery.ThenBy(lambda)
                    : orderedQuery.ThenByDescending(lambda);
            }
        }
        
        return orderedQuery ?? query;
    }

    /// <summary>
    /// Applies pagination to the query.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="query">The source queryable.</param>
    /// <param name="page">The page number (1-based). Defaults to 1 if less than or equal to 0.</param>
    /// <param name="pageSize">The number of records per page. Defaults to 20 if less than or equal to 0.</param>
    /// <returns>The queryable with pagination applied.</returns>
    /// <remarks>
    /// <para>
    /// If <see cref="QueryBuilderOptions.MaxPageSize"/> is set and pageSize exceeds it,
    /// pageSize is clamped to the maximum value.
    /// </para>
    /// <para>
    /// Pagination is implemented using Skip and Take for efficient database queries.
    /// </para>
    /// </remarks>
    private IQueryable<T> ApplyPagination<T>(IQueryable<T> query, int page, int pageSize) where T : class
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        
        // Ограничение максимального размера страницы
        if (_options.MaxPageSize > 0 && pageSize > _options.MaxPageSize)
            pageSize = _options.MaxPageSize;
        
        return query.Skip((page - 1) * pageSize).Take(pageSize);
    }

    /// <summary>
    /// Gets the list of valid include paths for the entity type.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="includes">The requested include paths.</param>
    /// <returns>A filtered list containing only valid navigation properties.</returns>
    /// <remarks>
    /// Valid includes are properties that are either class types or implement ICollection&lt;T&gt;.
    /// </remarks>
    private List<string> GetValidIncludes<T>(List<string> includes) where T : class
    {
        var validProperties = typeof(T).GetProperties()
            .Where(p => p.PropertyType.IsClass ||
                       p.PropertyType.GetInterfaces().Any(i => i.IsGenericType &&
                           i.GetGenericTypeDefinition() == typeof(ICollection<>)))
            .Select(p => p.Name)
            .ToHashSet();
        
        return includes.Where(include => validProperties.Contains(include)).ToList();
    }

    /// <summary>
    /// Gets the list of valid filter fields for the entity type.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="filters">The requested filters.</param>
    /// <returns>A filtered list containing only filters on valid properties.</returns>
    private List<QueryFilter> GetValidFilters<T>(List<QueryFilter> filters) where T : class
    {
        var validProperties = typeof(T).GetProperties().Select(p => p.Name).ToHashSet();
        return filters.Where(f => validProperties.Contains(f.Field)).ToList();
    }

    /// <summary>
    /// Gets the list of valid sort fields for the entity type.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <param name="sortOptions">The requested sort options.</param>
    /// <returns>A filtered list containing only sorts on valid properties.</returns>
    private List<SortOption> GetValidSortOptions<T>(List<SortOption> sortOptions) where T : class
    {
        var validProperties = typeof(T).GetProperties().Select(p => p.Name).ToHashSet();
        return sortOptions.Where(s => validProperties.Contains(s.Field)).ToList();
    }

    /// <summary>
    /// Creates a lambda expression for accessing a property by name.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    /// <typeparam name="TProp">The property type.</typeparam>
    /// <param name="propertyName">The name of the property.</param>
    /// <returns>A lambda expression that accesses the property.</returns>
    private Expression<Func<T, TProp>> CreatePropertyLambda<T, TProp>(string propertyName)
    {
        var parameter = Expression.Parameter(typeof(T));
        var property = Expression.Property(parameter, propertyName);
        return Expression.Lambda<Func<T, TProp>>(property, parameter);
    }

    /// <summary>
    /// Converts a value to the target type, handling special cases like Guid and Enum.
    /// </summary>
    /// <param name="targetType">The target type to convert to.</param>
    /// <param name="value">The value to convert.</param>
    /// <returns>The converted value, or the original value if conversion fails and error throwing is disabled.</returns>
    /// <remarks>
    /// <para>
    /// Special handling is provided for:
    /// <list type="bullet">
    /// <item><description>Guid: Parsed from string representation</description></item>
    /// <item><description>Enum: Parsed from string representation</description></item>
    /// <item><description>Nullable types: Unwrapped to get the underlying type</description></item>
    /// </list>
    /// </para>
    /// <para>
    /// If <see cref="QueryBuilderOptions.ThrowOnConversionError"/> is enabled, exceptions are thrown;
    /// otherwise, the original value is returned.
    /// </para>
    /// </remarks>
    private object ConvertValue(Type targetType, object value)
    {
        if (value == null) return null;
        
        var underlyingType = Nullable.GetUnderlyingType(targetType) ?? targetType;
        
        try
        {
            if (underlyingType == typeof(Guid))
                return Guid.Parse(value.ToString());
            
            if (underlyingType.IsEnum)
                return Enum.Parse(underlyingType, value.ToString());
            
            return Convert.ChangeType(value, underlyingType);
        }
        catch (Exception ex)
        {
            if (_options.ThrowOnConversionError)
                throw new InvalidOperationException($"Error converting value '{value}' to type '{underlyingType.Name}': {ex.Message}", ex);
            
            return value;
        }
    }
}
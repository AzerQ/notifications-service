import { FilterLogic, FilterOperator, QueryFilter, QueryRequest, SortDirection, SortOption } from "./types";

export type PropertyType<T, K extends keyof T> = T[K];
export type FilterValueType<T, K extends keyof T> = T[K] | T[K][] | string;

export class QueryBuilder<T extends Record<string, any>> {
  private request: QueryRequest = {
    filters: [],
    sort: [],
    page: 1,
    pageSize: 20,
    includes: []
  };

  // FILTER METHODS
  where<K extends keyof T>(
    field: K, 
    operator: FilterOperator, 
    value: FilterValueType<T, K>,
    logic: FilterLogic = FilterLogic.And
  ): QueryBuilder<T> {
    this.request.filters.push({
      field: field as string,
      operator,
      value,
      logic
    });
    return this;
  }

  equals<K extends keyof T>(field: K, value: PropertyType<T, K>): QueryBuilder<T> {
    return this.where(field, FilterOperator.Equals, value);
  }

  notEquals<K extends keyof T>(field: K, value: PropertyType<T, K>): QueryBuilder<T> {
    return this.where(field, FilterOperator.NotEquals, value);
  }

  greaterThan<K extends keyof T>(field: K, value: PropertyType<T, K>): QueryBuilder<T> {
    return this.where(field, FilterOperator.GreaterThan, value);
  }

  greaterThanOrEqual<K extends keyof T>(field: K, value: PropertyType<T, K>): QueryBuilder<T> {
    return this.where(field, FilterOperator.GreaterThanOrEqual, value);
  }

  lessThan<K extends keyof T>(field: K, value: PropertyType<T, K>): QueryBuilder<T> {
    return this.where(field, FilterOperator.LessThan, value);
  }

  lessThanOrEqual<K extends keyof T>(field: K, value: PropertyType<T, K>): QueryBuilder<T> {
    return this.where(field, FilterOperator.LessThanOrEqual, value);
  }

  contains<K extends keyof T>(field: K, value: string): QueryBuilder<T> {
    return this.where(field, FilterOperator.Contains, value);
  }

  startsWith<K extends keyof T>(field: K, value: string): QueryBuilder<T> {
    return this.where(field, FilterOperator.StartsWith, value);
  }

  endsWith<K extends keyof T>(field: K, value: string): QueryBuilder<T> {
    return this.where(field, FilterOperator.EndsWith, value);
  }

  in<K extends keyof T>(field: K, values: PropertyType<T, K>[]): QueryBuilder<T> {
    return this.where(field, FilterOperator.In, values);
  }

  // LOGIC METHODS
  and(): QueryBuilder<T> {
    if (this.request.filters.length > 0) {
      this.request.filters[this.request.filters.length - 1].logic = FilterLogic.And;
    }
    return this;
  }

  or(): QueryBuilder<T> {
    if (this.request.filters.length > 0) {
      this.request.filters[this.request.filters.length - 1].logic = FilterLogic.Or;
    }
    return this;
  }

  // SORT METHODS
  orderBy<K extends keyof T>(field: K, direction: SortDirection = SortDirection.Ascending): QueryBuilder<T> {
    this.request.sort.push({
      field: field as string,
      direction
    });
    return this;
  }

  orderByDescending<K extends keyof T>(field: K): QueryBuilder<T> {
    return this.orderBy(field, SortDirection.Descending);
  }

  thenBy<K extends keyof T>(field: K, direction: SortDirection = SortDirection.Ascending): QueryBuilder<T> {
    return this.orderBy(field, direction);
  }

  thenByDescending<K extends keyof T>(field: K): QueryBuilder<T> {
    return this.thenBy(field, SortDirection.Descending);
  }

  // PAGINATION METHODS
  page(page: number): QueryBuilder<T> {
    this.request.page = Math.max(1, page);
    return this;
  }

  pageSize(size: number): QueryBuilder<T> {
    this.request.pageSize = Math.max(1, size);
    return this;
  }

  skipTake(skip: number, take: number): QueryBuilder<T> {
    this.request.page = Math.floor(skip / take) + 1;
    this.request.pageSize = take;
    return this;
  }

  // INCLUDE METHODS
  include<K extends keyof T>(field: K): QueryBuilder<T> {
    this.request.includes.push(field as string);
    return this;
  }

  includes<K extends keyof T>(...fields: K[]): QueryBuilder<T> {
    fields.forEach(field => this.include(field));
    return this;
  }

  // COUNT METHODS
  withTotalCount(include: boolean = true): QueryBuilder<T> {
    this.request.includeTotalCount = include;
    return this;
  }

  // BUILD METHOD
  build(): QueryRequest {
    return { ...this.request };
  }

  // RESET METHOD
  reset(): QueryBuilder<T> {
    this.request = {
      filters: [],
      sort: [],
      page: 1,
      pageSize: 20,
      includes: []
    };
    return this;
  }

  // UTILITY METHODS
  getFilters(): QueryFilter[] {
    return [...this.request.filters];
  }

  getSort(): SortOption[] {
    return [...this.request.sort];
  }

  clone(): QueryBuilder<T> {
    const newBuilder = new QueryBuilder<T>();
    newBuilder.request = JSON.parse(JSON.stringify(this.request));
    return newBuilder;
  }
}
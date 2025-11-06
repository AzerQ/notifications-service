export enum FilterOperator {
  Equals = "Equals",
  NotEquals = "NotEquals",
  GreaterThan = "GreaterThan", 
  GreaterThanOrEqual = "GreaterThanOrEqual",
  LessThan = "LessThan",
  LessThanOrEqual = "LessThanOrEqual",
  Contains = "Contains",
  StartsWith = "StartsWith",
  EndsWith = "EndsWith",
  In = "In"
}

export enum FilterLogic {
  And = "And",
  Or = "Or"
}

export enum SortDirection {
  Ascending = "Ascending",
  Descending = "Descending"
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: FilterLogic;
}

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export interface QueryRequest {
  filters: QueryFilter[];
  sort: SortOption[];
  page: number;
  pageSize: number;
  includes: string[];
  includeTotalCount?: boolean;
}

export interface QueryResult<T> {
  data: T[];
  totalCount?: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}
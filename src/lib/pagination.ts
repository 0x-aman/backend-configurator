/**
 * Pagination Utilities
 * 
 * Provides consistent pagination across all list endpoints
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calculate pagination values
 * 
 * @param params - Pagination parameters from request
 * @param total - Total count of items
 * @returns Calculated pagination metadata
 */
export function calculatePagination(params: PaginationParams, total: number) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create a paginated response
 * 
 * @param data - Array of items for current page
 * @param params - Pagination parameters
 * @param total - Total count of all items
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  params: PaginationParams,
  total: number
): PaginatedResponse<T> {
  const pagination = calculatePagination(params, total);

  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    },
  };
}

/**
 * Extract pagination params from URL search params
 * 
 * @param searchParams - URL search parameters
 * @returns Pagination parameters object
 */
export function getPaginationFromSearchParams(
  searchParams: URLSearchParams
): PaginationParams {
  return {
    page: searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : undefined,
    limit: searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
  };
}

/**
 * Build Prisma pagination options
 * 
 * @param params - Pagination parameters
 * @param defaultSortBy - Default field to sort by
 * @returns Prisma query options (skip, take, orderBy)
 */
export function buildPrismaOptions(
  params: PaginationParams,
  defaultSortBy: string = "createdAt"
) {
  const pagination = calculatePagination(params, 0); // Total not needed here
  const sortBy = params.sortBy || defaultSortBy;
  const sortOrder = params.sortOrder || "desc";

  return {
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  };
}

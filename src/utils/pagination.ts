export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationResult<T> {
  data: T[];
  next_cursor: string | null;
}

/**
 * Standard pagination helper calculating offset and limit with safe boundaries
 */
export const calculatePagination = (pageParam?: number, limitParam?: number) => {
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitParam) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build standardized offset pagination response format per assignment specification
 */
export const buildOffsetPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): { data: T[]; total: number; page: number; limit: number } => {
  return {
    data,
    total,
    page,
    limit,
  };
};

/**
 * Build standardized cursor pagination response format per assignment specification
 */
export const buildCursorPaginationResponse = <T extends { id: string }>(
  data: T[],
  limit: number
): CursorPaginationResult<T> => {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const next_cursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

  return {
    data: items,
    next_cursor,
  };
};

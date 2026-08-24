import { describe, it, expect } from 'vitest';
import {
  calculatePagination,
  buildOffsetPaginationResponse,
  buildCursorPaginationResponse,
} from '../../src/utils/pagination';

describe('Unit Tests: Pagination Helpers', () => {
  it('should calculate offset and limit with default boundaries', () => {
    const result = calculatePagination(undefined, undefined);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('should calculate offset correctly for custom page and limit', () => {
    const result = calculatePagination(3, 15);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(15);
    expect(result.skip).toBe(30); // (3 - 1) * 15
  });

  it('should clamp limit to max 100 and min 1', () => {
    const upperClamped = calculatePagination(1, 500);
    expect(upperClamped.limit).toBe(100);

    const lowerClamped = calculatePagination(0, -5);
    expect(lowerClamped.page).toBe(1);
    expect(lowerClamped.limit).toBe(1);
  });

  it('should format offset pagination response matching specification', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const response = buildOffsetPaginationResponse(items, 50, 2, 20);

    expect(response).toEqual({
      data: items,
      total: 50,
      page: 2,
      limit: 20,
    });
  });

  it('should format cursor pagination response with next_cursor', () => {
    const items = [{ id: 'task-1' }, { id: 'task-2' }, { id: 'task-3' }];
    const response = buildCursorPaginationResponse(items, 2);

    expect(response.data).toEqual([{ id: 'task-1' }, { id: 'task-2' }]);
    expect(response.next_cursor).toBe('task-2');
  });

  it('should return null next_cursor when there are no more items', () => {
    const items = [{ id: 'task-1' }, { id: 'task-2' }];
    const response = buildCursorPaginationResponse(items, 2);

    expect(response.data).toEqual([{ id: 'task-1' }, { id: 'task-2' }]);
    expect(response.next_cursor).toBeNull();
  });
});

import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
    title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional(),
    status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.todo),
    priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.medium),
    dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    assigneeIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

export const unassignTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

export const bulkTaskStatusSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().uuid('Invalid task ID format')).min(1, 'At least one task ID is required'),
    status: z.nativeEnum(TaskStatus),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    cursor: z.string().uuid().optional(),
    paginationType: z.enum(['offset', 'cursor']).default('offset'),
    projectId: z.string().uuid().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignee: z.string().uuid().optional(),
    due_from: z.string().optional(),
    due_to: z.string().optional(),
    q: z.string().optional(), // Full-Text Search query
    includeDeleted: z.enum(['true', 'false']).optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type AssignTaskInput = z.infer<typeof assignTaskSchema>['body'];
export type BulkTaskStatusInput = z.infer<typeof bulkTaskStatusSchema>['body'];
export type ListTasksQuery = z.infer<typeof listTasksSchema>['query'];

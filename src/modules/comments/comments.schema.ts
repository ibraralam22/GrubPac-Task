import { z } from 'zod';

export const createCommentSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(3000, 'Comment content cannot exceed 3000 characters'),
  }),
});

export const listCommentsSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];

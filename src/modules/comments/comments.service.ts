import { commentsRepository, CommentsRepository } from './comments.repository';
import { tasksService, TasksService } from '../tasks/tasks.service';
import { CreateCommentInput } from './comments.schema';

export class CommentsService {
  constructor(
    private readonly repo: CommentsRepository = commentsRepository,
    private readonly taskService: TasksService = tasksService
  ) {}

  async createComment(taskId: string, authorId: string, orgId: string, input: CreateCommentInput) {
    // Verify task exists and belongs to the user's organization
    await this.taskService.getTaskById(taskId, orgId);

    return this.repo.create({
      taskId,
      authorId,
      content: input.content,
    });
  }

  async listComments(taskId: string, orgId: string) {
    // Verify task exists and belongs to the user's organization
    await this.taskService.getTaskById(taskId, orgId);

    return this.repo.findByTaskId(taskId);
  }
}

export const commentsService = new CommentsService();

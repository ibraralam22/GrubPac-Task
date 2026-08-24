import { tasksRepository, TasksRepository } from './tasks.repository';
import { projectsRepository, ProjectsRepository } from '../projects/projects.repository';
import {
  CreateTaskInput,
  UpdateTaskInput,
  AssignTaskInput,
  BulkTaskStatusInput,
  ListTasksQuery,
} from './tasks.schema';
import { NotFoundError, ForbiddenError, BadRequestError, AppError } from '../../errors/AppError';
import {
  calculatePagination,
  buildOffsetPaginationResponse,
  buildCursorPaginationResponse,
} from '../../utils/pagination';
import { prisma } from '../../config/prisma';
import { enqueueAssignmentNotification } from '../../jobs/queue';

export class TasksService {
  constructor(
    private readonly repo: TasksRepository = tasksRepository,
    private readonly projectRepo: ProjectsRepository = projectsRepository
  ) {}

  async createTask(orgId: string, input: CreateTaskInput) {
    // 1. Verify project exists and belongs to the authenticated user's organization
    const project = await this.projectRepo.findById(input.projectId, undefined, true);
    if (!project) {
      throw new NotFoundError(`Project with ID '${input.projectId}' not found`, 'PROJECT_NOT_FOUND', {
        projectId: input.projectId,
      });
    }

    if (project.orgId !== orgId) {
      throw new ForbiddenError(
        'Cross-tenant access forbidden: Cannot create a task in a project belonging to another organization',
        'CROSS_TENANT_ACCESS_FORBIDDEN'
      );
    }

    if (project.deletedAt) {
      throw new AppError('Cannot create a task in a deleted project', 400, 'PROJECT_DELETED');
    }

    // 2. Validate that any provided assignees belong to the same organization
    if (input.assigneeIds && input.assigneeIds.length > 0) {
      const validMembers = await prisma.orgMember.findMany({
        where: {
          orgId,
          userId: { in: input.assigneeIds },
        },
      });

      if (validMembers.length !== input.assigneeIds.length) {
        throw new ForbiddenError(
          'All assigned users must belong to the same organization as the project',
          'CROSS_TENANT_ASSIGNEE_FORBIDDEN'
        );
      }
    }

    const dueDate = input.dueDate ? new Date(input.dueDate) : null;

    return this.repo.create({
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate,
      assigneeIds: input.assigneeIds,
    });
  }

  async listTasks(orgId: string, query: ListTasksQuery) {
    const includeDeleted = query.includeDeleted === 'true';
    const dueFrom = query.due_from ? new Date(query.due_from) : undefined;
    const dueTo = query.due_to ? new Date(query.due_to) : undefined;

    const filters = {
      orgId,
      projectId: query.projectId,
      status: query.status,
      priority: query.priority,
      assignee: query.assignee,
      dueFrom,
      dueTo,
      search: query.q,
      includeDeleted,
    };

    if (query.paginationType === 'cursor') {
      const limit = query.limit || 20;
      const items = await this.repo.findManyCursor(filters, query.cursor, limit);
      return buildCursorPaginationResponse(items, limit);
    }

    // Default: Offset pagination
    const { page, limit, skip } = calculatePagination(query.page, query.limit);
    const { data, total } = await this.repo.findManyOffset(filters, skip, limit);
    return buildOffsetPaginationResponse(data, total, page, limit);
  }

  async getTaskById(id: string, orgId: string) {
    const task = await this.repo.findById(id, true);
    if (!task) {
      throw new NotFoundError(`Task with ID '${id}' was not found`, 'TASK_NOT_FOUND', { taskId: id });
    }

    if (task.project.orgId !== orgId) {
      throw new ForbiddenError(
        'Cross-tenant access forbidden: Task belongs to a different organization',
        'CROSS_TENANT_ACCESS_FORBIDDEN'
      );
    }

    if (task.deletedAt) {
      throw new NotFoundError(`Task with ID '${id}' has been deleted`, 'TASK_DELETED', { taskId: id });
    }

    return task;
  }

  async updateTask(id: string, orgId: string, input: UpdateTaskInput) {
    await this.getTaskById(id, orgId); // Enforces existence & org boundary

    const dueDate = input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined;

    return this.repo.update(id, {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate,
    });
  }

  async deleteTask(id: string, orgId: string) {
    await this.getTaskById(id, orgId); // Enforces existence & org boundary

    await this.repo.softDelete(id);
    return { success: true, message: 'Task soft-deleted successfully', taskId: id };
  }

  async bulkUpdateStatus(orgId: string, input: BulkTaskStatusInput) {
    // Verify all task IDs belong to the organization
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: input.taskIds },
        project: { orgId },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (tasks.length !== input.taskIds.length) {
      throw new ForbiddenError(
        'One or more tasks do not exist or belong to a different organization',
        'CROSS_TENANT_BULK_UPDATE_FORBIDDEN'
      );
    }

    await this.repo.bulkUpdateStatus(input.taskIds, input.status);
    return {
      success: true,
      updatedCount: tasks.length,
      status: input.status,
      taskIds: input.taskIds,
    };
  }

  /**
   * Assign a user to a task:
   * 1. Validates task exists and belongs to user's org.
   * 2. Validates assigned user belongs to the SAME organization.
   * 3. Persists assignment in PostgreSQL within a Transactional Outbox record.
   * 4. Enqueues asynchronous email notification job to BullMQ without blocking API response.
   */
  async assignTask(
    taskId: string,
    assigneeUserId: string,
    assignedByUser: { id: string; name: string; email: string },
    orgId: string,
    orgName: string
  ) {
    const task = await this.getTaskById(taskId, orgId);

    // Validate assigned user belongs to the SAME organization
    const targetMember = await prisma.orgMember.findUnique({
      where: {
        uq_org_user: {
          orgId,
          userId: assigneeUserId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!targetMember) {
      throw new ForbiddenError(
        'The assigned user must belong to the same organization as the task',
        'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'
      );
    }

    // Persist assignment & Outbox entry atomically in DB transaction
    const assignment = await prisma.$transaction(async (tx) => {
      const assigned = await tx.taskAssignment.upsert({
        where: {
          uq_task_user_assignment: {
            taskId,
            userId: assigneeUserId,
          },
        },
        create: {
          taskId,
          userId: assigneeUserId,
        },
        update: {
          assignedAt: new Date(),
        },
        include: {
          task: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Write to Transactional Outbox
      await tx.outboxJob.create({
        data: {
          jobType: 'task-assignment-notification',
          payload: {
            taskId: task.id,
            taskTitle: task.title,
            userId: targetMember.user.id,
            userEmail: targetMember.user.email,
            userName: targetMember.user.name,
            assignedByUserId: assignedByUser.id,
            assignedByUserName: assignedByUser.name,
            orgId,
            orgName,
            assignedAt: new Date().toISOString(),
          },
          status: 'pending',
        },
      });

      return assigned;
    });

    // Enqueue asynchronous job to BullMQ (Consistency Strategy: outbox guaranteed in DB, enqueued async)
    const enqueueResult = await enqueueAssignmentNotification({
      taskId: task.id,
      taskTitle: task.title,
      userId: targetMember.user.id,
      userEmail: targetMember.user.email,
      userName: targetMember.user.name,
      assignedByUserId: assignedByUser.id,
      assignedByUserName: assignedByUser.name,
      orgId,
      orgName,
      assignedAt: new Date().toISOString(),
    });

    return {
      assignment,
      job: {
        id: enqueueResult.jobId,
        enqueued: enqueueResult.enqueued,
      },
    };
  }

  async unassignTask(taskId: string, userId: string, orgId: string) {
    await this.getTaskById(taskId, orgId);

    const result = await this.repo.unassignUser(taskId, userId);
    return {
      success: true,
      message: 'User unassigned from task successfully',
      taskId,
      userId,
      deletedCount: result.count,
    };
  }
}

export const tasksService = new TasksService();

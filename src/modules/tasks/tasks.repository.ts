import { prisma } from '../../config/prisma';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

export interface TaskFilterParams {
  orgId: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueFrom?: Date;
  dueTo?: Date;
  search?: string;
  includeDeleted?: boolean;
}

export class TasksRepository {
  async create(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    assigneeIds?: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate,
        },
      });

      if (data.assigneeIds && data.assigneeIds.length > 0) {
        await tx.taskAssignment.createMany({
          data: data.assigneeIds.map((userId) => ({
            taskId: task.id,
            userId,
          })),
        });
      }

      return tx.task.findUnique({
        where: { id: task.id },
        include: {
          project: true,
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    });
  }

  async findById(id: string, includeDeleted: boolean = false) {
    const where: Prisma.TaskWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return prisma.task.findFirst({
      where,
      include: {
        project: {
          include: {
            organization: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async findManyOffset(
    filters: TaskFilterParams,
    skip: number,
    limit: number
  ) {
    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          project: {
            select: { id: true, name: true, orgId: true },
          },
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { data, total };
  }

  async findManyCursor(
    filters: TaskFilterParams,
    cursor?: string,
    limit: number = 20
  ) {
    const where = this.buildWhereClause(filters);

    const data = await prisma.task.findMany({
      where,
      take: limit + 1, // take one extra to determine next_cursor
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { id: 'asc' },
      include: {
        project: {
          select: { id: true, name: true, orgId: true },
        },
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return data;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
    }
  ) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        project: true,
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async softDelete(id: string) {
    return prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async bulkUpdateStatus(taskIds: string[], status: TaskStatus) {
    return prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        deletedAt: null,
      },
      data: {
        status,
      },
    });
  }

  async assignUser(taskId: string, userId: string) {
    return prisma.taskAssignment.upsert({
      where: {
        uq_task_user_assignment: {
          taskId,
          userId,
        },
      },
      create: {
        taskId,
        userId,
      },
      update: {
        assignedAt: new Date(),
      },
      include: {
        task: true,
        user: true,
      },
    });
  }

  async unassignUser(taskId: string, userId: string) {
    return prisma.taskAssignment.deleteMany({
      where: {
        taskId,
        userId,
      },
    });
  }

  private buildWhereClause(filters: TaskFilterParams): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {
      project: {
        orgId: filters.orgId,
        ...(filters.includeDeleted ? {} : { deletedAt: null }),
      },
      ...(filters.includeDeleted ? {} : { deletedAt: null }),
    };

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignee) {
      where.assignments = {
        some: {
          userId: filters.assignee,
        },
      };
    }

    if (filters.dueFrom || filters.dueTo) {
      where.dueDate = {};
      if (filters.dueFrom) {
        where.dueDate.gte = filters.dueFrom;
      }
      if (filters.dueTo) {
        where.dueDate.lte = filters.dueTo;
      }
    }

    // PostgreSQL Full-Text Search on task title + description (using GIN index)
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.trim();
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}

export const tasksRepository = new TasksRepository();

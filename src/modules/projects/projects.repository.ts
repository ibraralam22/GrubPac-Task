import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class ProjectsRepository {
  async create(data: { orgId: string; name: string; description?: string }) {
    return prisma.project.create({
      data: {
        orgId: data.orgId,
        name: data.name,
        description: data.description,
      },
    });
  }

  async findById(id: string, orgId?: string, includeDeleted: boolean = false) {
    const where: Prisma.ProjectWhereInput = { id };
    if (orgId) {
      where.orgId = orgId;
    }
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return prisma.project.findFirst({
      where,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async findMany(params: {
    orgId: string;
    skip: number;
    limit: number;
    search?: string;
    includeDeleted?: boolean;
  }) {
    const where: Prisma.ProjectWhereInput = {
      orgId: params.orgId,
      ...(params.includeDeleted ? {} : { deletedAt: null }),
      ...(params.search
        ? {
            name: {
              contains: params.search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, orgId: string, data: { name?: string; description?: string }) {
    return prisma.project.updateMany({
      where: {
        id,
        orgId,
        deletedAt: null,
      },
      data,
    });
  }

  async softDelete(id: string, orgId: string) {
    return prisma.project.updateMany({
      where: {
        id,
        orgId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getDashboardStats(projectId: string, orgId: string) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId, deletedAt: null },
    });

    if (!project) return null;

    // Group tasks by status
    const statusGroups = await prisma.task.groupBy({
      by: ['status'],
      where: {
        projectId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    // Priority breakdown
    const priorityGroups = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        projectId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    // Total tasks and overdue tasks
    const now = new Date();
    const [totalTasks, overdueTasks] = await Promise.all([
      prisma.task.count({
        where: { projectId, deletedAt: null },
      }),
      prisma.task.count({
        where: {
          projectId,
          deletedAt: null,
          status: { not: 'done' },
          dueDate: { lt: now },
        },
      }),
    ]);

    const statusCounts = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    statusGroups.forEach((g) => {
      statusCounts[g.status] = g._count.id;
    });

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    priorityGroups.forEach((g) => {
      priorityCounts[g.priority] = g._count.id;
    });

    const completionRate = totalTasks > 0 ? Math.round((statusCounts.done / totalTasks) * 100) : 0;

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
      },
      summary: {
        totalTasks,
        completionRate: `${completionRate}%`,
        overdueTasks,
      },
      taskCountsByStatus: statusCounts,
      taskCountsByPriority: priorityCounts,
    };
  }
}

export const projectsRepository = new ProjectsRepository();

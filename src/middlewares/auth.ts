import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { prisma } from '../config/prisma';

/**
 * Authentication middleware: verifies JWT access token and sets authenticated user + org context
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header with Bearer token is required', 'AUTH_HEADER_MISSING');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account associated with token no longer exists', 'USER_NOT_FOUND');
    }

    if (user.memberships.length === 0) {
      throw new ForbiddenError('User is not associated with any organization', 'NO_ORGANIZATION_MEMBERSHIP');
    }

    // Determine target organization context:
    // If client passes x-organization-id header, validate that user is an actual member
    const headerOrgId = req.headers['x-organization-id'] as string | undefined;
    let targetMembership = user.memberships.find((m) => m.orgId === (headerOrgId || decoded.orgId));

    if (headerOrgId && !targetMembership) {
      // Cross-tenant access attempt: Trying to access an organization where user has no membership
      throw new ForbiddenError(
        'Cross-tenant access forbidden: User does not belong to the requested organization',
        'CROSS_TENANT_ACCESS_FORBIDDEN'
      );
    }

    // Fallback to primary membership if decoded org is not matched
    if (!targetMembership) {
      targetMembership = user.memberships[0];
    }

    // Attach validated context to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    req.authOrg = {
      orgId: targetMembership.orgId,
      role: targetMembership.role,
      name: targetMembership.organization.name,
      slug: targetMembership.organization.slug,
    };

    next();
  } catch (error) {
    next(error);
  }
};

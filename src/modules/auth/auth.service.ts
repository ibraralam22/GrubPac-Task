import { authRepository, AuthRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../utils/token';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../../errors/AppError';
import { RegisterInput, LoginInput, RefreshInput, LogoutInput } from './auth.schema';
import crypto from 'crypto';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async register(input: RegisterInput) {
    const existingUser = await this.repo.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists', 'USER_EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);
    const orgName = input.organizationName || `${input.name}'s Workspace`;
    const orgSlug = `${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const { user, organization, membership } = await this.repo.createUserWithOrganization({
      email: input.email,
      passwordHash,
      name: input.name,
      orgName,
      orgSlug,
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      orgId: organization.id,
      role: membership.role,
    });

    const familyId = crypto.randomUUID();
    const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        role: membership.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer',
      },
    };
  }

  async login(input: LoginInput) {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.memberships.length === 0) {
      throw new ForbiddenError('User does not belong to any organization', 'NO_ORGANIZATION_MEMBERSHIP');
    }

    let activeMembership = user.memberships[0];
    if (input.organizationId) {
      const match = user.memberships.find((m) => m.orgId === input.organizationId);
      if (!match) {
        throw new ForbiddenError(
          'User is not authorized for the requested organization',
          'CROSS_TENANT_ACCESS_FORBIDDEN'
        );
      }
      activeMembership = match;
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      orgId: activeMembership.orgId,
      role: activeMembership.role,
    });

    const familyId = crypto.randomUUID();
    const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: activeMembership.organization.id,
        name: activeMembership.organization.name,
        slug: activeMembership.organization.slug,
        role: activeMembership.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 min
        tokenType: 'Bearer',
      },
    };
  }

  async refresh(input: RefreshInput) {
    const tokenHash = hashToken(input.refreshToken);
    const storedToken = await this.repo.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token', 'REFRESH_TOKEN_INVALID');
    }

    // Token rotation reuse detection: If a revoked token is presented, compromise is suspected!
    // Invalidate the entire token family to protect user account.
    if (storedToken.revokedAt) {
      await this.repo.revokeTokenFamily(storedToken.familyId);
      throw new UnauthorizedError(
        'Revoked refresh token presented. All session tokens invalidated for security.',
        'REFRESH_TOKEN_REUSED'
      );
    }

    if (new Date() > storedToken.expiresAt) {
      await this.repo.revokeRefreshToken(storedToken.id);
      throw new UnauthorizedError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
    }

    // Revoke currently used token
    await this.repo.revokeRefreshToken(storedToken.id);

    const user = storedToken.user;
    if (user.memberships.length === 0) {
      throw new ForbiddenError('User has no active organization membership', 'NO_ORGANIZATION_MEMBERSHIP');
    }

    const primaryMembership = user.memberships[0];

    // Issue new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      orgId: primaryMembership.orgId,
      role: primaryMembership.role,
    });

    // Issue new rotated refresh token under the SAME familyId
    const { token: newRefreshToken, tokenHash: newTokenHash, expiresAt: newExpiresAt } = generateRefreshToken();

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      familyId: storedToken.familyId,
      expiresAt: newExpiresAt,
    });

    return {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
        tokenType: 'Bearer',
      },
    };
  }

  async logout(input: LogoutInput) {
    const tokenHash = hashToken(input.refreshToken);
    const storedToken = await this.repo.findRefreshTokenByHash(tokenHash);
    if (storedToken && !storedToken.revokedAt) {
      await this.repo.revokeRefreshToken(storedToken.id);
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.repo.revokeAllUserRefreshTokens(userId);
    return { success: true, message: 'Logged out from all devices successfully' };
  }
}

export const authService = new AuthService();

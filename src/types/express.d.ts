export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedOrg {
  orgId: string;
  role: 'org_admin' | 'member';
  name: string;
  slug: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      authOrg?: AuthenticatedOrg;
    }
  }
}

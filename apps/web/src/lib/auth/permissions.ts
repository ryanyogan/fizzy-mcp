import { createAccessControl } from 'better-auth/plugins/access';

// Define resource permissions
export const statements = {
  apiKey: ['create', 'read', 'delete', 'list'],
  usage: ['read', 'export'],
  user: ['list', 'ban', 'unban', 'set-role', 'delete', 'impersonate'],
  settings: ['read', 'update'],
  stats: ['read'],
} as const;

export const ac = createAccessControl(statements);

// Define roles
export const roles = {
  user: ac.newRole({
    apiKey: ['create', 'read', 'delete', 'list'],
    usage: ['read'],
  }),
  admin: ac.newRole({
    apiKey: ['create', 'read', 'delete', 'list'],
    usage: ['read', 'export'],
    user: ['list', 'ban', 'unban', 'set-role', 'delete', 'impersonate'],
    settings: ['read', 'update'],
    stats: ['read'],
  }),
};

export type UserRole = keyof typeof roles;

export function isAdmin(role: string | undefined): boolean {
  return role === 'admin';
}

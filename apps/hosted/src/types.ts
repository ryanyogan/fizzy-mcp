/**
 * Type definitions for the hosted Fizzy MCP service
 *
 * Note: We don't reference worker-configuration.d.ts because we need to
 * override the ENVIRONMENT type to allow multiple values.
 */

/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  // D1 Database
  DB: D1Database;
  // KV Namespace for rate limiting and session cache
  KV: KVNamespace;
  // Environment (development, staging, production)
  ENVIRONMENT: 'development' | 'staging' | 'production';
  // Better Auth secrets
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

/**
 * User roles in the system
 */
export type UserRole = 'user' | 'admin';

/**
 * User tier based on authentication status
 */
export type UserTier = 'anonymous' | 'authenticated' | 'admin';

/**
 * Session context passed through middleware
 */
export interface SessionContext {
  userId: string | null;
  sessionId: string;
  apiKeyId: string | null;
  tier: UserTier;
  role: UserRole | null;
  isAnonymous: boolean;
}

/**
 * Fizzy token context - token is always required, accountSlug is truly optional
 */
export interface FizzyContext {
  token: string;
  accountSlug: string | undefined;
}

/**
 * Hono app variables (available via c.get/c.set)
 */
export interface AppVariables {
  session: SessionContext;
  fizzy: FizzyContext;
  requestId: string;
  remainingWrites: number;
}

/**
 * Combined Hono bindings type
 */
export interface HonoEnv {
  Bindings: Env;
  Variables: AppVariables;
}

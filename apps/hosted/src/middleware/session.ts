import { createMiddleware } from 'hono/factory';
import type { HonoEnv, SessionContext, UserTier } from '../types';

/**
 * Anonymous session data stored in KV
 */
interface AnonymousSession {
  sessionId: string;
  createdAt: string;
  lastSeen: string;
  ipAddress: string;
}

/**
 * Session middleware that handles both anonymous and authenticated users
 *
 * For anonymous users:
 * - Creates/retrieves session from KV based on a session cookie or generates new
 * - Sessions expire after 30 days of inactivity
 *
 * For authenticated users (with API key):
 * - Validates the API key via Better Auth
 * - Extracts user info and role
 */
export const sessionMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const apiKey = c.req.header('X-API-Key');
  const requestId = crypto.randomUUID();
  c.set('requestId', requestId);

  // Check for API key authentication
  if (apiKey && apiKey.startsWith('fmcp_')) {
    // TODO: Validate API key via Better Auth when implemented
    // For now, we'll set up the structure for authenticated sessions
    const session: SessionContext = {
      userId: null, // Will be populated from API key validation
      sessionId: requestId,
      apiKeyId: null,
      tier: 'anonymous' as UserTier, // Will be 'authenticated' after validation
      role: null,
      isAnonymous: true, // Will be false after validation
    };
    c.set('session', session);
    await next();
    return;
  }

  // Anonymous session handling
  const sessionCookie = getCookie(c, 'fmcp_session');
  let sessionId = sessionCookie;
  let isNewSession = false;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    isNewSession = true;
  }

  // Try to get existing session from KV
  const kvKey = `anon:session:${sessionId}`;
  let anonSession: AnonymousSession | null = null;

  if (!isNewSession) {
    anonSession = await c.env.KV.get(kvKey, 'json');
  }

  const now = new Date().toISOString();
  const ipAddress = c.req.header('CF-Connecting-IP') || 'unknown';

  if (!anonSession) {
    // Create new session
    anonSession = {
      sessionId,
      createdAt: now,
      lastSeen: now,
      ipAddress,
    };
    isNewSession = true;
  } else {
    // Update last seen
    anonSession.lastSeen = now;
  }

  // Store/update session in KV (30 day TTL)
  await c.env.KV.put(kvKey, JSON.stringify(anonSession), {
    expirationTtl: 30 * 24 * 60 * 60, // 30 days
  });

  // Set session cookie if new
  if (isNewSession) {
    setCookie(c, 'fmcp_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  }

  const session: SessionContext = {
    userId: null,
    sessionId,
    apiKeyId: null,
    tier: 'anonymous',
    role: null,
    isAnonymous: true,
  };

  c.set('session', session);
  await next();
});

/**
 * Simple cookie getter
 */
function getCookie(
  c: { req: { header: (name: string) => string | undefined } },
  name: string,
): string | undefined {
  const cookies = c.req.header('Cookie');
  if (!cookies) return undefined;

  const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : undefined;
}

/**
 * Simple cookie setter
 */
function setCookie(
  c: { header: (name: string, value: string) => void },
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    maxAge?: number;
    path?: string;
  },
): void {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);

  c.header('Set-Cookie', parts.join('; '));
}

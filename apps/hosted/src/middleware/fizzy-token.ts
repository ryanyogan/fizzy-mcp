import { createMiddleware } from 'hono/factory';
import type { HonoEnv } from '../types';

/**
 * Middleware to extract Fizzy token from request headers
 *
 * Accepts token from:
 * - X-Fizzy-Token header (preferred)
 * - X-Fizzy-Account-Slug header (optional account slug)
 */
export const fizzyTokenMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const token = c.req.header('X-Fizzy-Token');
  const accountSlug = c.req.header('X-Fizzy-Account-Slug');

  if (token) {
    c.set('fizzy', {
      token,
      accountSlug: accountSlug || undefined,
    });
  }

  await next();
});

/**
 * Middleware that requires a Fizzy token to be present
 * Use this on routes that need Fizzy API access
 */
export const requireFizzyToken = createMiddleware<HonoEnv>(
  async (c, next): Promise<Response | void> => {
    const fizzy = c.get('fizzy');

    if (!fizzy?.token) {
      return c.json(
        {
          error: 'missing_fizzy_token',
          message: 'X-Fizzy-Token header is required to access Fizzy API',
        },
        401,
      );
    }

    await next();
  },
);

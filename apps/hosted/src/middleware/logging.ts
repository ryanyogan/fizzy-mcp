import { createMiddleware } from 'hono/factory';
import type { HonoEnv } from '../types';

/**
 * Request logging middleware
 * Logs request details and timing information
 */
export const loggingMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const requestId = c.get('requestId') || crypto.randomUUID();

  // Log request start
  console.log(
    JSON.stringify({
      type: 'request',
      requestId,
      method,
      path,
      timestamp: new Date().toISOString(),
    }),
  );

  await next();

  // Log request completion
  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(
    JSON.stringify({
      type: 'response',
      requestId,
      method,
      path,
      status,
      duration,
      timestamp: new Date().toISOString(),
    }),
  );
});

/**
 * Error logging middleware
 * Should be used at the top of the middleware stack
 */
export const errorLoggingMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  try {
    await next();
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';

    console.error(
      JSON.stringify({
        type: 'error',
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }),
    );

    throw error;
  }
});

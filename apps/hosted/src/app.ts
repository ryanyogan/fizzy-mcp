import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { HonoEnv } from './types';
import { apiRoutes } from './api';
import { mcpRoutes } from './mcp/handler';
import { sessionMiddleware } from './middleware/session';
import { fizzyTokenMiddleware } from './middleware/fizzy-token';
import { loggingMiddleware, errorLoggingMiddleware } from './middleware/logging';

/**
 * Create the Hono application
 */
export function createApp() {
  const app = new Hono<HonoEnv>();

  // Global middleware
  app.use('*', errorLoggingMiddleware);
  app.use('*', loggingMiddleware);
  app.use('*', secureHeaders());
  app.use(
    '*',
    cors({
      origin: ['https://fizzy-mcp.yogan.dev', 'https://fizzy.yogan.dev'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Fizzy-Token', 'X-API-Key', 'X-Fizzy-Account-Slug'],
      exposeHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-User-Tier',
        'X-Request-Id',
      ],
      credentials: true,
      maxAge: 86400,
    }),
  );

  // Session and token extraction (applied to all routes)
  app.use('*', sessionMiddleware);
  app.use('*', fizzyTokenMiddleware);

  // Root endpoint
  app.get('/', (c) => {
    return c.json({
      name: 'Fizzy MCP Hosted Service',
      version: '0.1.0',
      endpoints: {
        mcp: '/mcp',
        api: '/api',
        health: '/api/health',
        docs: 'https://fizzy.yogan.dev',
      },
    });
  });

  // Mount routes
  app.route('/api', apiRoutes);
  app.route('/mcp', mcpRoutes);

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        error: 'not_found',
        message: `Route not found: ${c.req.method} ${c.req.path}`,
      },
      404,
    );
  });

  // Error handler
  app.onError((err, c) => {
    console.error('Unhandled error:', err);

    const isDev = c.env.ENVIRONMENT === 'development';

    return c.json(
      {
        error: 'internal_server_error',
        message: isDev ? err.message : 'An unexpected error occurred',
        requestId: c.get('requestId'),
      },
      500,
    );
  });

  return app;
}

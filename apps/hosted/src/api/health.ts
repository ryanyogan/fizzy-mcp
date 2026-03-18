import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { SERVER_INFO } from '../mcp/server';

/**
 * Health and info routes (public)
 */
export const healthRoutes = new Hono<HonoEnv>();

/**
 * Health check endpoint
 */
healthRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: SERVER_INFO.version,
  });
});

/**
 * Public info endpoint
 */
healthRoutes.get('/info', (c) => {
  return c.json({
    service: {
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      description: 'Open source MCP server for Fizzy task management',
    },
    endpoints: {
      mcp: '/mcp',
      health: '/health',
      docs: 'https://fizzy.yogan.dev',
    },
    authentication: {
      fizzyToken: {
        header: 'X-Fizzy-Token',
        description: 'Your Fizzy personal access token (required)',
        howToGet: 'https://app.fizzy.do → Profile → API → Personal Access Tokens',
      },
      accountSlug: {
        header: 'X-Fizzy-Account-Slug',
        description: 'Account slug (optional, auto-detected if not provided)',
      },
    },
    github: 'https://github.com/ryanyogan/fizzy-do-mcp',
  });
});

/**
 * Ready check for load balancers
 */
healthRoutes.get('/ready', (c) => {
  return c.json({
    status: 'ready',
  });
});

import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { SERVER_INFO } from '../mcp/server';
import { DEFAULT_SETTINGS } from '../services/settings';

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
 * Returns service information and tier limits
 */
healthRoutes.get('/info', (c) => {
  return c.json({
    service: {
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      description: 'Hosted MCP server for Fizzy task management',
    },
    endpoints: {
      mcp: '/mcp',
      api: '/api',
      docs: 'https://fizzy.yogan.dev',
    },
    tiers: {
      anonymous: {
        dailyWrites: DEFAULT_SETTINGS.anonymous_daily_limit,
        description: 'No authentication required, limited access',
      },
      authenticated: {
        dailyWrites: DEFAULT_SETTINGS.authenticated_daily_limit,
        description: 'Create an account and API key for higher limits',
      },
      admin: {
        dailyWrites: 'unlimited',
        description: 'Full access to all features',
      },
    },
    authentication: {
      fizzyToken: {
        header: 'X-Fizzy-Token',
        description: 'Your Fizzy API token (required for MCP access)',
      },
      apiKey: {
        header: 'X-API-Key',
        description: 'Platform API key for higher limits (optional)',
        prefix: 'fmcp_',
      },
    },
  });
});

/**
 * Ready check for load balancers
 */
healthRoutes.get('/ready', async (c) => {
  try {
    // Quick D1 connectivity check
    await c.env.DB.prepare('SELECT 1').first();

    return c.json({
      status: 'ready',
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    return c.json(
      {
        status: 'not_ready',
        checks: {
          database: 'error',
        },
      },
      503,
    );
  }
});

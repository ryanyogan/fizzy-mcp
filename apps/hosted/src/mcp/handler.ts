import { Hono } from 'hono';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { HonoEnv } from '../types';
import { createFizzyMcpServer, getTierLimit, SERVER_INFO } from './server';
import { isWriteOperation } from './write-operations';
import { createDb } from '../db/index';
import { SettingsService } from '../services/settings';
import { UsageService } from '../services/usage';

/**
 * MCP routes handler
 */
export const mcpRoutes = new Hono<HonoEnv>();

/**
 * MCP endpoint - handles Streamable HTTP transport
 *
 * Uses stateless mode since each request creates a new transport.
 * The MCP server is created per-request with the user's Fizzy credentials.
 */
mcpRoutes.all('/', async (c) => {
  const fizzy = c.get('fizzy');
  const session = c.get('session');
  const requestId = c.get('requestId');

  if (!fizzy?.token) {
    return c.json(
      {
        error: 'missing_fizzy_token',
        message: 'X-Fizzy-Token header is required',
        requestId,
      },
      401,
    );
  }

  // Get settings and usage services
  const db = createDb(c.env.DB);
  const settingsService = new SettingsService(db, c.env.KV);
  const usageService = new UsageService(db, c.env.KV);

  // Check daily limits for write operations
  const settings = await settingsService.getAll();
  const limit = getTierLimit(session.tier, settings);
  const today = new Date().toISOString().split('T')[0]!;
  const usage = await usageService.getDailyUsage(session.sessionId, session.userId, today);

  // Store remaining writes for response headers
  const remainingWrites = limit === -1 ? Infinity : Math.max(0, limit - usage.writeCount);
  c.set('remainingWrites', remainingWrites);

  // If at limit, reject immediately
  if (limit !== -1 && usage.writeCount >= limit) {
    return c.json(
      {
        error: 'daily_limit_exceeded',
        message: `Daily write limit of ${limit} reached. ${
          session.isAnonymous
            ? 'Create an account and API key for higher limits.'
            : 'Try again tomorrow.'
        }`,
        limit,
        used: usage.writeCount,
        remaining: 0,
        resetAt: `${today}T00:00:00Z`,
        requestId,
      },
      429,
    );
  }

  // Create MCP server with user's Fizzy credentials
  const mcpServer = createFizzyMcpServer(fizzy.token, fizzy.accountSlug);

  // Create a stateless transport for this request
  // Each request gets its own transport and server instance
  // Stateless mode = omit sessionIdGenerator (no session management needed since we're per-request)
  const transport = new WebStandardStreamableHTTPServerTransport({
    // Enable JSON responses for simple request/response scenarios
    enableJsonResponse: true,
  });

  // Connect the server to the transport
  await mcpServer.connect(transport);

  // Handle the request
  const response = await transport.handleRequest(c.req.raw);

  // Add rate limit headers to response
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(limit === -1 ? 'unlimited' : limit));
  headers.set('X-RateLimit-Remaining', String(remainingWrites));
  headers.set('X-RateLimit-Reset', `${today}T00:00:00Z`);
  headers.set('X-User-Tier', session.tier);
  headers.set('X-Request-Id', requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

/**
 * MCP server info endpoint
 */
mcpRoutes.get('/info', (c) => {
  return c.json({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    transport: 'streamable-http',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
  });
});

export { isWriteOperation };

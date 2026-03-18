import { Hono } from 'hono';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { HonoEnv } from '../types';
import { createFizzyMcpServer, SERVER_INFO } from './server';

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

  // Create MCP server with user's Fizzy credentials
  const mcpServer = createFizzyMcpServer(fizzy.token, fizzy.accountSlug);

  // Create a stateless transport for this request
  // Each request gets its own transport and server instance
  const transport = new WebStandardStreamableHTTPServerTransport({
    // Enable JSON responses for simple request/response scenarios
    enableJsonResponse: true,
  });

  // Connect the server to the transport
  await mcpServer.connect(transport);

  // Handle the request
  const response = await transport.handleRequest(c.req.raw);

  // Add request ID header
  const headers = new Headers(response.headers);
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

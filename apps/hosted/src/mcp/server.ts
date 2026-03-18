import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FizzyClient } from '@fizzy-mcp/client';
import { registerAllTools } from '@fizzy-mcp/tools';

/**
 * Server metadata
 */
export const SERVER_INFO = {
  name: 'Fizzy MCP',
  version: '0.2.0',
} as const;

/**
 * Create a Fizzy MCP server instance with the user's credentials
 */
export function createFizzyMcpServer(
  fizzyToken: string,
  accountSlug: string | undefined,
): McpServer {
  // Create the Fizzy API client with user's credentials
  // Use spread to conditionally include accountSlug only when defined
  // (required for exactOptionalPropertyTypes compatibility)
  const client = new FizzyClient({
    accessToken: fizzyToken,
    ...(accountSlug !== undefined && { accountSlug }),
  });

  // Create the MCP server
  const server = new McpServer({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
  });

  // Register all Fizzy tools
  registerAllTools(server, client);

  return server;
}

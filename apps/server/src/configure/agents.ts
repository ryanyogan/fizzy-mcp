/**
 * AI agent configuration detection and paths.
 *
 * Supports auto-configuration for:
 * - Claude Desktop
 * - Cursor
 * - OpenCode
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { type ServerMode, HOSTED_URLS } from '@fizzy-mcp/shared';

/**
 * Supported AI agents that can be auto-configured.
 */
export type AgentType = 'claude-desktop' | 'cursor' | 'opencode';

/**
 * Information about an AI agent.
 */
export interface AgentInfo {
  type: AgentType;
  name: string;
  description: string;
  configPath: string;
  exists: boolean;
}

/**
 * MCP server configuration for Fizzy - Local mode (Claude Desktop / Cursor format).
 */
export interface McpServerConfigLocal {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/**
 * MCP server configuration for Fizzy - Remote mode (HTTP transport).
 */
export interface McpServerConfigRemote {
  transport: 'http';
  url: string;
  headers: Record<string, string>;
}

/**
 * MCP server configuration for OpenCode - Local mode.
 */
export interface OpenCodeServerConfigLocal {
  type: 'local';
  command: string[];
  env?: Record<string, string>;
}

/**
 * MCP server configuration for OpenCode - Remote mode.
 */
export interface OpenCodeServerConfigRemote {
  type: 'http';
  url: string;
  headers: Record<string, string>;
}

export type McpServerConfig = McpServerConfigLocal | McpServerConfigRemote;
export type OpenCodeServerConfig = OpenCodeServerConfigLocal | OpenCodeServerConfigRemote;

/**
 * Configuration options for generating server config.
 */
export interface ServerConfigOptions {
  mode: ServerMode;
  accessToken: string;
  accountSlug?: string;
  hostedApiKey?: string;
  hostedUrl?: string;
}

/**
 * Gets the home directory cross-platform.
 */
function getHome(): string {
  return os.homedir();
}

/**
 * Gets the config path for Claude Desktop.
 */
function getClaudeDesktopConfigPath(): string {
  const platform = process.platform;
  const home = getHome();

  if (platform === 'darwin') {
    return path.join(
      home,
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json',
    );
  } else if (platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
      'Claude',
      'claude_desktop_config.json',
    );
  } else {
    // Linux
    return path.join(home, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

/**
 * Gets the config path for Cursor.
 */
function getCursorConfigPath(): string {
  const home = getHome();
  return path.join(home, '.cursor', 'mcp.json');
}

/**
 * Gets the config path for OpenCode.
 */
function getOpenCodeConfigPath(): string {
  const home = getHome();
  return path.join(home, '.config', 'opencode', 'opencode.json');
}

/**
 * Detects which AI agents are available on the system.
 *
 * @returns Array of detected agents with their config paths and existence status
 */
export function detectAgents(): AgentInfo[] {
  const agents: AgentInfo[] = [
    {
      type: 'claude-desktop',
      name: 'Claude Desktop',
      description: "Anthropic's official Claude desktop app",
      configPath: getClaudeDesktopConfigPath(),
      exists: false,
    },
    {
      type: 'cursor',
      name: 'Cursor',
      description: 'AI-powered code editor',
      configPath: getCursorConfigPath(),
      exists: false,
    },
    {
      type: 'opencode',
      name: 'OpenCode',
      description: 'Open-source AI coding assistant',
      configPath: getOpenCodeConfigPath(),
      exists: false,
    },
  ];

  // Check if config files or parent directories exist
  for (const agent of agents) {
    const configDir = path.dirname(agent.configPath);
    // Consider agent "exists" if the config file exists OR the parent directory exists
    // (meaning the app is likely installed but not yet configured)
    agent.exists = fs.existsSync(agent.configPath) || fs.existsSync(configDir);
  }

  return agents;
}

/**
 * Gets agents that are available for configuration.
 */
export function getAvailableAgents(): AgentInfo[] {
  return detectAgents().filter((agent) => agent.exists);
}

/**
 * Generates the Fizzy MCP server configuration for a specific agent.
 *
 * @param agentType - The type of agent to generate config for
 * @param options - Configuration options (mode, credentials, etc.)
 * @returns The MCP server configuration object
 */
export function generateServerConfig(
  agentType: AgentType,
  options: ServerConfigOptions,
): McpServerConfig | OpenCodeServerConfig {
  const { mode, accessToken, accountSlug, hostedApiKey, hostedUrl } = options;

  if (mode === 'remote') {
    // Remote mode - use HTTP transport
    const url = hostedUrl || HOSTED_URLS.mcp;
    const headers: Record<string, string> = {
      'X-Fizzy-Token': accessToken,
    };

    if (accountSlug) {
      headers['X-Fizzy-Account-Slug'] = accountSlug;
    }

    if (hostedApiKey) {
      headers['X-API-Key'] = hostedApiKey;
    }

    if (agentType === 'opencode') {
      return {
        type: 'http',
        url,
        headers,
      };
    }

    // Claude Desktop and Cursor
    return {
      transport: 'http',
      url,
      headers,
    };
  }

  // Local mode - use stdio transport
  if (agentType === 'opencode') {
    // OpenCode uses command as an array, no separate args
    return {
      type: 'local',
      command: ['npx', '-y', 'fizzy-do-mcp@latest'],
    };
  }

  // Claude Desktop and Cursor use command + args format
  return {
    command: 'npx',
    args: ['-y', 'fizzy-do-mcp@latest'],
  };
}

/**
 * Reads an existing agent configuration file.
 *
 * @param configPath - Path to the config file
 * @returns The parsed configuration or null if not found/invalid
 */
export function readAgentConfig(configPath: string): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(configPath)) {
      return null;
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Writes an agent configuration file.
 *
 * @param configPath - Path to the config file
 * @param config - The configuration to write
 */
export function writeAgentConfig(configPath: string, config: Record<string, unknown>): void {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Adds Fizzy MCP server to an agent's configuration.
 *
 * @param agent - The agent to configure
 * @param options - Configuration options (mode, credentials, etc.)
 * @returns true if configuration was added/updated, false if already present
 */
export function configureAgent(agent: AgentInfo, options: ServerConfigOptions): boolean {
  const existingConfig = readAgentConfig(agent.configPath) || {};
  const serverConfig = generateServerConfig(agent.type, options);

  let configKey: string;
  const serverKey = 'fizzy';

  switch (agent.type) {
    case 'claude-desktop':
    case 'cursor':
      configKey = 'mcpServers';
      break;
    case 'opencode':
      configKey = 'mcp';
      break;
    default:
      return false;
  }

  // Get or create the servers section
  const servers = (existingConfig[configKey] as Record<string, unknown>) || {};

  // Always update the config to ensure it has the latest credentials/mode
  servers[serverKey] = serverConfig;

  existingConfig[configKey] = servers;
  writeAgentConfig(agent.configPath, existingConfig);

  return true;
}

/**
 * Checks if Fizzy is already configured in an agent.
 *
 * @param agent - The agent to check
 * @returns true if Fizzy is already configured
 */
export function isAgentConfigured(agent: AgentInfo): boolean {
  const config = readAgentConfig(agent.configPath);
  if (!config) return false;

  const configKey = agent.type === 'opencode' ? 'mcp' : 'mcpServers';
  const servers = config[configKey] as Record<string, unknown> | undefined;

  return servers?.['fizzy'] !== undefined;
}

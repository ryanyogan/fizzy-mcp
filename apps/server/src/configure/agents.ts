/**
 * AI agent configuration detection and paths.
 *
 * Supports auto-configuration for:
 * - Claude Desktop
 * - Cursor
 * - OpenCode
 * - Windsurf
 * - Continue
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Supported AI agents that can be auto-configured.
 */
export type AgentType = 'claude-desktop' | 'cursor' | 'opencode' | 'windsurf' | 'continue';

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
 * MCP server configuration for Fizzy - Claude Desktop / Cursor / Windsurf format.
 */
export interface McpServerConfigStdio {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/**
 * MCP server configuration for OpenCode - Local mode.
 * Note: OpenCode uses 'environment' not 'env', and 'command' is an array
 */
export interface OpenCodeServerConfigLocal {
  type: 'local';
  command: string[];
  enabled?: boolean;
  environment?: Record<string, string>;
}

/**
 * MCP server configuration for OpenCode - Remote mode.
 * Note: OpenCode uses 'remote' not 'http'
 */
export interface OpenCodeServerConfigRemote {
  type: 'remote';
  url: string;
  headers?: Record<string, string>;
  enabled?: boolean;
}

/**
 * MCP server configuration for Continue (YAML format, but we store as JSON).
 */
export interface ContinueServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export type McpServerConfig = McpServerConfigStdio;
export type OpenCodeServerConfig = OpenCodeServerConfigLocal | OpenCodeServerConfigRemote;

/**
 * Configuration options for generating server config.
 */
export interface ServerConfigOptions {
  accessToken: string;
  accountSlug?: string;
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
 * Gets the config path for Windsurf.
 */
function getWindsurfConfigPath(): string {
  const home = getHome();
  return path.join(home, '.windsurf', 'mcp.json');
}

/**
 * Gets the config path for Continue.
 */
function getContinueConfigPath(): string {
  const home = getHome();
  return path.join(home, '.continue', 'config.json');
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
    {
      type: 'windsurf',
      name: 'Windsurf',
      description: 'AI code editor by Codeium',
      configPath: getWindsurfConfigPath(),
      exists: false,
    },
    {
      type: 'continue',
      name: 'Continue',
      description: 'Open-source AI code assistant for VS Code/JetBrains',
      configPath: getContinueConfigPath(),
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
 * @param _options - Configuration options (unused since we use stored credentials)
 * @returns The MCP server configuration object
 */
export function generateServerConfig(
  agentType: AgentType,
  _options: ServerConfigOptions,
): McpServerConfig | OpenCodeServerConfig | ContinueServerConfig {
  // All agents use local mode with npx - credentials are stored in config file
  if (agentType === 'opencode') {
    // OpenCode uses different format
    return {
      type: 'local',
      command: ['npx', '-y', 'fizzy-do-mcp@latest'],
      enabled: true,
    };
  }

  if (agentType === 'continue') {
    // Continue uses name + command + args
    return {
      name: 'fizzy',
      command: 'npx',
      args: ['-y', 'fizzy-do-mcp@latest'],
    };
  }

  // Claude Desktop, Cursor, and Windsurf use the same format
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
 * Gets the config key and server key for an agent type.
 */
function getAgentConfigKeys(agentType: AgentType): { configKey: string; serverKey: string } {
  switch (agentType) {
    case 'claude-desktop':
    case 'cursor':
    case 'windsurf':
      return { configKey: 'mcpServers', serverKey: 'fizzy' };
    case 'opencode':
      return { configKey: 'mcp', serverKey: 'fizzy' };
    case 'continue':
      // Continue uses mcpServers array, not object
      return { configKey: 'mcpServers', serverKey: 'fizzy' };
    default:
      return { configKey: 'mcpServers', serverKey: 'fizzy' };
  }
}

/**
 * Adds Fizzy MCP server to an agent's configuration.
 *
 * @param agent - The agent to configure
 * @param options - Configuration options
 * @returns true if configuration was added/updated, false if already present
 */
export function configureAgent(agent: AgentInfo, options: ServerConfigOptions): boolean {
  const existingConfig = readAgentConfig(agent.configPath) || {};
  const serverConfig = generateServerConfig(agent.type, options);
  const { configKey, serverKey } = getAgentConfigKeys(agent.type);

  if (agent.type === 'continue') {
    // Continue uses an array of servers, not an object
    const servers = (existingConfig[configKey] as ContinueServerConfig[] | undefined) || [];

    // Check if fizzy already exists
    const existingIndex = servers.findIndex((s) => s.name === 'fizzy');

    if (existingIndex >= 0) {
      servers[existingIndex] = serverConfig as ContinueServerConfig;
    } else {
      servers.push(serverConfig as ContinueServerConfig);
    }

    existingConfig[configKey] = servers;
  } else {
    // Other agents use an object
    const servers = (existingConfig[configKey] as Record<string, unknown>) || {};
    servers[serverKey] = serverConfig;
    existingConfig[configKey] = servers;
  }

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

  const { configKey } = getAgentConfigKeys(agent.type);

  if (agent.type === 'continue') {
    const servers = config[configKey] as ContinueServerConfig[] | undefined;
    return servers?.some((s) => s.name === 'fizzy') ?? false;
  }

  const servers = config[configKey] as Record<string, unknown> | undefined;
  return servers?.['fizzy'] !== undefined;
}

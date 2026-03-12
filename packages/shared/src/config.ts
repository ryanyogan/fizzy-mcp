import { z } from 'zod';

/**
 * Server mode - local (stdio) or remote (HTTP).
 */
export const ServerModeSchema = z.enum(['local', 'remote']);
export type ServerMode = z.infer<typeof ServerModeSchema>;

/**
 * Configuration schema for the Fizzy MCP server.
 */
export const FizzyConfigSchema = z.object({
  /**
   * Personal access token for authenticating with the Fizzy API.
   * Generate one at: https://app.fizzy.do → Profile → API → Personal Access Tokens
   */
  accessToken: z.string().min(1, 'Access token is required'),

  /**
   * Fizzy account slug (e.g., "/897362094").
   * Found in any Fizzy URL after logging in.
   * If not provided, it will be auto-detected from your first account.
   */
  accountSlug: z.string().optional(),

  /**
   * Base URL for the Fizzy API.
   * Defaults to "https://app.fizzy.do".
   */
  baseUrl: z.string().url().optional().default('https://app.fizzy.do'),
});

export type FizzyConfig = z.infer<typeof FizzyConfigSchema>;

/**
 * Configuration stored in the config file (~/.config/fizzy-mcp/config.json).
 */
export const StoredConfigSchema = z.object({
  /**
   * Server mode: 'local' runs MCP server locally via stdio,
   * 'remote' uses the hosted service.
   */
  mode: ServerModeSchema.optional(),

  /**
   * Fizzy personal access token.
   */
  accessToken: z.string().optional(),

  /**
   * Fizzy account slug.
   */
  accountSlug: z.string().optional(),

  /**
   * Fizzy API base URL.
   */
  baseUrl: z.string().url().optional(),

  /**
   * API key for the hosted service (for higher rate limits).
   * Prefixed with 'fmcp_'.
   */
  hostedApiKey: z.string().optional(),

  /**
   * Custom URL for the hosted MCP service.
   * Defaults to the official hosted service if not specified.
   */
  hostedUrl: z.string().url().optional(),
});

export type StoredConfig = z.infer<typeof StoredConfigSchema>;

/**
 * Default configuration values.
 */
export const DEFAULT_CONFIG = {
  baseUrl: 'https://app.fizzy.do',
  hostedUrl: 'https://fizzy-mcp-hosted.ryanyogan.workers.dev',
  mode: 'remote' as ServerMode,
} as const;

/**
 * Environment variable names for configuration.
 */
export const ENV_VARS = {
  accessToken: 'FIZZY_ACCESS_TOKEN',
  accountSlug: 'FIZZY_ACCOUNT_SLUG',
  baseUrl: 'FIZZY_BASE_URL',
  hostedApiKey: 'FIZZY_MCP_API_KEY',
  mode: 'FIZZY_MCP_MODE',
} as const;

/**
 * Configuration file paths.
 */
export const CONFIG_PATHS = {
  dir: '.config/fizzy-mcp',
  file: 'config.json',
} as const;

/**
 * URLs for the hosted service.
 */
export const HOSTED_URLS = {
  base: 'https://fizzy-mcp-hosted.ryanyogan.workers.dev',
  mcp: 'https://fizzy-mcp-hosted.ryanyogan.workers.dev/mcp',
  apiKeys: 'https://fizzy-mcp-hosted.ryanyogan.workers.dev/api-keys', // Future dashboard
} as const;

/**
 * URL for Fizzy API token generation page.
 */
export const FIZZY_TOKEN_URL = 'https://app.fizzy.do/my/profile/api';

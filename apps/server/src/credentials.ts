import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  type FizzyConfig,
  type StoredConfig,
  FizzyConfigSchema,
  StoredConfigSchema,
  DEFAULT_CONFIG,
  ENV_VARS,
  CONFIG_PATHS,
  OLD_CONFIG_PATHS,
} from '@fizzy-do-mcp/shared';

/**
 * Gets the full path to the config directory.
 */
export function getConfigDir(): string {
  return path.join(os.homedir(), CONFIG_PATHS.dir);
}

/**
 * Gets the full path to the old config directory (for migration).
 */
export function getOldConfigDir(): string {
  return path.join(os.homedir(), OLD_CONFIG_PATHS.dir);
}

/**
 * Gets the full path to the config file.
 */
export function getConfigPath(): string {
  return path.join(getConfigDir(), CONFIG_PATHS.file);
}

/**
 * Gets the full path to the old config file (for migration).
 */
export function getOldConfigPath(): string {
  return path.join(getOldConfigDir(), OLD_CONFIG_PATHS.file);
}

/**
 * Ensures the config directory exists with proper permissions.
 */
export function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

/**
 * Migrates config from old path (~/.config/fizzy-mcp) to new path (~/.config/fizzy-do-mcp).
 * This is called automatically when reading config.
 *
 * @returns true if migration was performed
 */
export function migrateConfigIfNeeded(): boolean {
  const oldPath = getOldConfigPath();
  const newPath = getConfigPath();

  // Only migrate if old config exists and new config doesn't
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    try {
      ensureConfigDir();
      fs.copyFileSync(oldPath, newPath);
      // Set secure permissions on the new file
      fs.chmodSync(newPath, 0o600);
      console.error('Migrated config from ~/.config/fizzy-mcp to ~/.config/fizzy-do-mcp');
      return true;
    } catch (error) {
      console.error(`Warning: Could not migrate config: ${String(error)}`);
      return false;
    }
  }

  return false;
}

/**
 * Reads the stored config from the config file.
 * Returns empty object if file doesn't exist.
 * Automatically migrates from old config path if needed.
 */
export function readStoredConfig(): StoredConfig {
  // Try to migrate from old path first
  migrateConfigIfNeeded();

  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const data = JSON.parse(content);
    return StoredConfigSchema.parse(data);
  } catch (error) {
    // Return empty config on parse errors - will prompt for re-auth
    console.error(`Warning: Could not read config file: ${String(error)}`);
    return {};
  }
}

/**
 * Saves config to the config file with secure permissions (mode 600).
 */
export function saveConfig(config: StoredConfig): void {
  ensureConfigDir();
  const configPath = getConfigPath();

  // Write with mode 600 (owner read/write only)
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

/**
 * Resolves the full configuration from environment variables and config file.
 * Environment variables take precedence over the config file.
 *
 * @returns The resolved configuration, or null if access token is missing
 */
export function resolveConfig(): FizzyConfig | null {
  const stored = readStoredConfig();

  const accessToken = process.env[ENV_VARS.accessToken] || stored.accessToken;
  const accountSlug = process.env[ENV_VARS.accountSlug] || stored.accountSlug;
  const baseUrl = process.env[ENV_VARS.baseUrl] || stored.baseUrl || DEFAULT_CONFIG.baseUrl;

  if (!accessToken) {
    return null;
  }

  const result = FizzyConfigSchema.safeParse({
    accessToken,
    accountSlug,
    baseUrl,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    return null;
  }

  return result.data;
}

/**
 * Checks if the server is configured (has an access token).
 */
export function isConfigured(): boolean {
  const accessToken = process.env[ENV_VARS.accessToken] || readStoredConfig().accessToken;
  return Boolean(accessToken);
}

/**
 * Clears the stored configuration.
 */
export function clearConfig(): void {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
}

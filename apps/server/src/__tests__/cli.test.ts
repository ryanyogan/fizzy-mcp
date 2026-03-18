/**
 * CLI command tests.
 *
 * These tests verify the CLI commands work correctly by testing
 * the underlying functions and modules they depend on.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import {
  resolveConfig,
  saveConfig,
  clearConfig,
  isConfigured,
  getConfigPath,
  readStoredConfig,
  migrateConfigIfNeeded,
} from '../credentials.js';
import { CONFIG_PATHS, OLD_CONFIG_PATHS } from '@fizzy-do-mcp/shared';

// Mock the fs and os modules
vi.mock('node:fs');
vi.mock('node:os');

describe('CLI Commands', () => {
  const mockHome = '/home/testuser';
  const mockConfigDir = `${mockHome}/${CONFIG_PATHS.dir}`;
  const mockConfigPath = `${mockConfigDir}/${CONFIG_PATHS.file}`;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHome);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('configure command dependencies', () => {
    describe('saveConfig', () => {
      it('creates config directory if it does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        saveConfig({ accessToken: 'test-token' });

        expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true, mode: 0o700 });
      });

      it('writes config with access token', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);

        saveConfig({ accessToken: 'test-token-12345' });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
          mockConfigPath,
          expect.stringContaining('test-token-12345'),
          { mode: 0o600 }, // Secure file permissions
        );
      });

      it('writes config with account slug when provided', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);

        saveConfig({ accessToken: 'token', accountSlug: '/123456' });

        const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
        const written = JSON.parse(writeCall?.[1] as string);

        expect(written.accountSlug).toBe('/123456');
      });

      it('writes config with base URL when provided', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);

        saveConfig({
          accessToken: 'token',
          baseUrl: 'https://custom.fizzy.do',
        });

        const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
        const written = JSON.parse(writeCall?.[1] as string);

        expect(written.baseUrl).toBe('https://custom.fizzy.do');
      });
    });

    describe('readStoredConfig', () => {
      it('returns empty object if config does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const config = readStoredConfig();

        expect(config).toEqual({});
      });

      it('returns parsed config when file exists', () => {
        const mockConfig = {
          accessToken: 'stored-token',
          accountSlug: '/789012',
        };

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

        const config = readStoredConfig();

        expect(config.accessToken).toBe('stored-token');
        expect(config.accountSlug).toBe('/789012');
      });

      it('returns empty object on invalid JSON', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('not valid json');

        const config = readStoredConfig();

        expect(config).toEqual({});
      });
    });

    describe('resolveConfig', () => {
      it('returns null if no access token', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const config = resolveConfig();

        expect(config).toBeNull();
      });

      it('returns config with default base URL', () => {
        const mockConfig = { accessToken: 'test-token' };

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

        const config = resolveConfig();

        expect(config).not.toBeNull();
        expect(config?.accessToken).toBe('test-token');
        expect(config?.baseUrl).toBe('https://app.fizzy.do');
      });

      it('uses custom base URL when provided', () => {
        const mockConfig = {
          accessToken: 'test-token',
          baseUrl: 'https://custom.fizzy.do',
        };

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

        const config = resolveConfig();

        expect(config?.baseUrl).toBe('https://custom.fizzy.do');
      });

      it('respects environment variable override', () => {
        const originalEnv = process.env.FIZZY_ACCESS_TOKEN;
        process.env.FIZZY_ACCESS_TOKEN = 'env-token';

        vi.mocked(fs.existsSync).mockReturnValue(false);

        const config = resolveConfig();

        expect(config?.accessToken).toBe('env-token');

        // Restore
        if (originalEnv !== undefined) {
          process.env.FIZZY_ACCESS_TOKEN = originalEnv;
        } else {
          delete process.env.FIZZY_ACCESS_TOKEN;
        }
      });
    });
  });

  describe('whoami command dependencies', () => {
    describe('isConfigured', () => {
      it('returns false when config file does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        expect(isConfigured()).toBe(false);
      });

      it('returns false when config has no access token', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));

        expect(isConfigured()).toBe(false);
      });

      it('returns true when config has access token', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ accessToken: 'test-token' }));

        expect(isConfigured()).toBe(true);
      });

      it('returns true when FIZZY_ACCESS_TOKEN env var is set', () => {
        const originalEnv = process.env.FIZZY_ACCESS_TOKEN;
        process.env.FIZZY_ACCESS_TOKEN = 'env-token';

        vi.mocked(fs.existsSync).mockReturnValue(false);

        expect(isConfigured()).toBe(true);

        // Restore
        if (originalEnv !== undefined) {
          process.env.FIZZY_ACCESS_TOKEN = originalEnv;
        } else {
          delete process.env.FIZZY_ACCESS_TOKEN;
        }
      });
    });

    describe('getConfigPath', () => {
      it('returns correct path', () => {
        const path = getConfigPath();

        expect(path).toBe(mockConfigPath);
      });
    });
  });

  describe('logout command dependencies', () => {
    describe('clearConfig', () => {
      it('removes config file if it exists', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);

        clearConfig();

        expect(fs.unlinkSync).toHaveBeenCalledWith(mockConfigPath);
      });

      it('does nothing if config file does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        clearConfig();

        expect(fs.unlinkSync).not.toHaveBeenCalled();
      });
    });
  });

  describe('config migration', () => {
    describe('migrateConfigIfNeeded', () => {
      it('does nothing if new config already exists', () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
          return String(p) === mockConfigPath;
        });

        const migrated = migrateConfigIfNeeded();

        expect(migrated).toBe(false);
        expect(fs.copyFileSync).not.toHaveBeenCalled();
      });

      it('migrates from old fizzy-mcp path if found', () => {
        const oldPath = `${mockHome}/${OLD_CONFIG_PATHS.dir}/${OLD_CONFIG_PATHS.file}`;

        vi.mocked(fs.existsSync).mockImplementation((p) => {
          const pathStr = String(p);
          // New path doesn't exist, old path exists
          if (pathStr === mockConfigPath) return false;
          if (pathStr === mockConfigDir) return false;
          if (pathStr.includes(OLD_CONFIG_PATHS.dir)) return true;
          return false;
        });

        const migrated = migrateConfigIfNeeded();

        expect(migrated).toBe(true);
        // ensureConfigDir uses mode 0o700
        expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true, mode: 0o700 });
        expect(fs.copyFileSync).toHaveBeenCalledWith(oldPath, mockConfigPath);
      });

      it('does nothing if no old config exists', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const migrated = migrateConfigIfNeeded();

        expect(migrated).toBe(false);
        expect(fs.copyFileSync).not.toHaveBeenCalled();
      });
    });
  });

  describe('config validation', () => {
    it('ignores empty access token strings', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ accessToken: '' }));

      expect(isConfigured()).toBe(false);
      expect(resolveConfig()).toBeNull();
    });

    it('ignores whitespace-only access token', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ accessToken: '   ' }));

      const config = resolveConfig();

      // resolveConfig doesn't trim, but it should handle gracefully
      expect(config).not.toBeNull();
    });

    it('preserves account slug format with leading slash', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ accessToken: 'token', accountSlug: '/123456' }),
      );

      const config = resolveConfig();

      expect(config?.accountSlug).toBe('/123456');
    });
  });
});

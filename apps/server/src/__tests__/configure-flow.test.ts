/**
 * Tests for the configure flow module.
 *
 * The configure flow handles detecting AI agents and configuring them
 * to use the Fizzy MCP server. These tests focus on the logic
 * without requiring interactive prompts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import {
  detectAgents,
  getAvailableAgents,
  generateServerConfig,
  configureAgent,
  isAgentConfigured,
  type AgentInfo,
  type ServerConfigOptions,
} from '../configure/agents.js';

// Mock the fs and os modules
vi.mock('node:fs');
vi.mock('node:os');

describe('Configure Flow', () => {
  const mockHome = '/home/testuser';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHome);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Server Configuration Generation', () => {
    const options: ServerConfigOptions = {
      accessToken: 'test-token-12345',
      accountSlug: '/123456',
    };

    it('generates npx command for standard agents', () => {
      const types = ['claude-desktop', 'cursor', 'windsurf'] as const;

      for (const type of types) {
        const config = generateServerConfig(type, options);

        // Standard configs have command and args at top level
        expect(config).toHaveProperty('command', 'npx');
        expect(config).toHaveProperty('args', ['-y', 'fizzy-do-mcp@latest']);
      }
    });

    it('includes type: local for OpenCode', () => {
      const config = generateServerConfig('opencode', options);

      expect(config).toHaveProperty('type', 'local');
      expect(config).toHaveProperty('enabled', true);
      // OpenCode uses array format for command
      expect(config).toHaveProperty('command', ['npx', '-y', 'fizzy-do-mcp@latest']);
    });

    it('includes name field for Continue', () => {
      const config = generateServerConfig('continue', options);

      expect(config).toHaveProperty('name', 'fizzy');
      expect(config).toHaveProperty('command', 'npx');
      expect(config).toHaveProperty('args', ['-y', 'fizzy-do-mcp@latest']);
    });
  });

  describe('Agent Configuration Workflow', () => {
    const mockCursorAgent: AgentInfo = {
      type: 'cursor',
      name: 'Cursor',
      description: 'AI-powered code editor',
      configPath: `${mockHome}/.cursor/mcp.json`,
      exists: true,
    };

    const options: ServerConfigOptions = {
      accessToken: 'test-token',
    };

    it('creates new config for fresh agent install', () => {
      // No existing config
      vi.mocked(fs.existsSync).mockReturnValue(false);

      configureAgent(mockCursorAgent, options);

      // Should create directory and write config
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();

      // Check written config structure
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const config = JSON.parse(writeCall?.[1] as string);

      expect(config).toHaveProperty('mcpServers');
      expect(config.mcpServers).toHaveProperty('fizzy');
      expect(config.mcpServers.fizzy.command).toBe('npx');
    });

    it('preserves existing servers when adding Fizzy', () => {
      const existingConfig = {
        mcpServers: {
          'other-server': {
            command: 'npx',
            args: ['-y', 'other-mcp@latest'],
          },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(mockCursorAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const config = JSON.parse(writeCall?.[1] as string);

      // Both servers should be present
      expect(config.mcpServers).toHaveProperty('other-server');
      expect(config.mcpServers).toHaveProperty('fizzy');
    });

    it('updates existing Fizzy config', () => {
      const existingConfig = {
        mcpServers: {
          fizzy: {
            command: 'node',
            args: ['/old/path/to/server.js'],
          },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(mockCursorAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const config = JSON.parse(writeCall?.[1] as string);

      // Should be updated to new format
      expect(config.mcpServers.fizzy.command).toBe('npx');
      expect(config.mcpServers.fizzy.args).toContain('fizzy-do-mcp@latest');
    });
  });

  describe('Agent Detection Logic', () => {
    it('detects all supported agent types', () => {
      // Mock all agents as existing
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const agents = detectAgents();
      const types = agents.map((a) => a.type);

      expect(types).toContain('claude-desktop');
      expect(types).toContain('cursor');
      expect(types).toContain('opencode');
      expect(types).toContain('windsurf');
      expect(types).toContain('continue');
    });

    it('reports correct config paths per platform', () => {
      const originalPlatform = process.platform;

      // Test Linux paths
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const linuxAgents = detectAgents();
      const claudeLinux = linuxAgents.find((a) => a.type === 'claude-desktop');

      expect(claudeLinux?.configPath).toContain('.config/Claude');

      // Restore
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('filters to only available agents', () => {
      // Only cursor and windsurf exist
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.cursor') || pathStr.includes('.windsurf');
      });

      const available = getAvailableAgents();

      expect(available.every((a) => a.exists)).toBe(true);
      expect(available.some((a) => a.type === 'cursor')).toBe(true);
      expect(available.some((a) => a.type === 'windsurf')).toBe(true);
      expect(available.some((a) => a.type === 'claude-desktop')).toBe(false);
    });
  });

  describe('Configuration Status Detection', () => {
    it('correctly identifies configured agents', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'Test',
        configPath: `${mockHome}/.cursor/mcp.json`,
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            fizzy: { command: 'npx', args: ['-y', 'fizzy-do-mcp@latest'] },
          },
        }),
      );

      expect(isAgentConfigured(agent)).toBe(true);
    });

    it('correctly identifies unconfigured agents', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'Test',
        configPath: `${mockHome}/.cursor/mcp.json`,
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'other-server': { command: 'other' },
          },
        }),
      );

      expect(isAgentConfigured(agent)).toBe(false);
    });

    it('handles missing config file gracefully', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'Test',
        configPath: `${mockHome}/.cursor/mcp.json`,
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(isAgentConfigured(agent)).toBe(false);
    });

    it('handles invalid JSON gracefully', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'Test',
        configPath: `${mockHome}/.cursor/mcp.json`,
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('not valid json {{{');

      expect(isAgentConfigured(agent)).toBe(false);
    });
  });

  describe('Continue Agent Special Handling', () => {
    const continueAgent: AgentInfo = {
      type: 'continue',
      name: 'Continue',
      description: 'AI code assistant',
      configPath: `${mockHome}/.continue/config.json`,
      exists: true,
    };

    const options: ServerConfigOptions = {
      accessToken: 'test-token',
    };

    it('handles Continue array-based mcpServers format', () => {
      const existingConfig = {
        mcpServers: [{ name: 'other-server', command: 'other' }],
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(continueAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const config = JSON.parse(writeCall?.[1] as string);

      // Should maintain array format
      expect(Array.isArray(config.mcpServers)).toBe(true);
      expect(config.mcpServers).toHaveLength(2);

      // Should have both servers
      const fizzy = config.mcpServers.find((s: { name: string }) => s.name === 'fizzy');
      const other = config.mcpServers.find((s: { name: string }) => s.name === 'other-server');

      expect(fizzy).toBeDefined();
      expect(other).toBeDefined();
    });

    it('updates existing Fizzy entry in Continue array', () => {
      const existingConfig = {
        mcpServers: [
          { name: 'fizzy', command: 'old-command' },
          { name: 'other', command: 'other' },
        ],
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(continueAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const config = JSON.parse(writeCall?.[1] as string);

      // Should still be 2 entries (update, not add)
      expect(config.mcpServers).toHaveLength(2);

      // Fizzy should be updated
      const fizzy = config.mcpServers.find((s: { name: string }) => s.name === 'fizzy');
      expect(fizzy.command).toBe('npx');
    });

    it('detects Fizzy in Continue array format', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: [{ name: 'fizzy', command: 'npx' }],
        }),
      );

      expect(isAgentConfigured(continueAgent)).toBe(true);
    });
  });

  describe('OpenCode Agent Special Handling', () => {
    const opencodeAgent: AgentInfo = {
      type: 'opencode',
      name: 'OpenCode',
      description: 'AI coding assistant',
      configPath: `${mockHome}/.config/opencode/config.json`,
      exists: true,
    };

    it('generates config with type: local', () => {
      const config = generateServerConfig('opencode', { accessToken: 'test' });

      expect(config).toHaveProperty('type', 'local');
      expect(config).toHaveProperty('enabled', true);
      expect(config).toHaveProperty('command');
      // Command is an array for OpenCode
      expect(Array.isArray((config as { command: string[] }).command)).toBe(true);
    });

    it('preserves existing OpenCode settings', () => {
      // OpenCode uses 'mcp' key, not 'mcpServers'
      const existingConfig = {
        ai: { provider: 'anthropic' },
        mcp: {
          'other-server': { type: 'local', command: ['other'] },
        },
      };

      const options: ServerConfigOptions = { accessToken: 'test-token' };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(opencodeAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const config = JSON.parse(writeCall?.[1] as string);

      // Should preserve ai settings
      expect(config.ai).toEqual({ provider: 'anthropic' });
      // Should have both servers in 'mcp' key
      expect(config.mcp).toHaveProperty('other-server');
      expect(config.mcp).toHaveProperty('fizzy');
    });
  });
});

/**
 * Tests for AI agent configuration detection and management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import {
  detectAgents,
  getAvailableAgents,
  generateServerConfig,
  readAgentConfig,
  writeAgentConfig,
  configureAgent,
  isAgentConfigured,
  type AgentInfo,
} from '../configure/agents.js';

// Mock the fs and os modules
vi.mock('node:fs');
vi.mock('node:os');

describe('Agent Configuration', () => {
  const mockHome = '/home/testuser';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHome);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectAgents', () => {
    it('detects Claude Desktop on Linux', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });

      // Mock Claude Desktop directory exists
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.config/Claude');
      });

      const agents = detectAgents();
      const claude = agents.find((a) => a.type === 'claude-desktop');

      expect(claude).toBeDefined();
      expect(claude?.exists).toBe(true);
      expect(claude?.configPath).toContain('.config/Claude');

      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('detects Cursor', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.cursor');
      });

      const agents = detectAgents();
      const cursor = agents.find((a) => a.type === 'cursor');

      expect(cursor).toBeDefined();
      expect(cursor?.exists).toBe(true);
      expect(cursor?.configPath).toContain('.cursor');
    });

    it('detects OpenCode', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.config/opencode');
      });

      const agents = detectAgents();
      const opencode = agents.find((a) => a.type === 'opencode');

      expect(opencode).toBeDefined();
      expect(opencode?.exists).toBe(true);
      expect(opencode?.configPath).toContain('opencode');
    });

    it('detects Windsurf', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.windsurf');
      });

      const agents = detectAgents();
      const windsurf = agents.find((a) => a.type === 'windsurf');

      expect(windsurf).toBeDefined();
      expect(windsurf?.exists).toBe(true);
      expect(windsurf?.configPath).toContain('.windsurf');
    });

    it('detects Continue', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.continue');
      });

      const agents = detectAgents();
      const continueAgent = agents.find((a) => a.type === 'continue');

      expect(continueAgent).toBeDefined();
      expect(continueAgent?.exists).toBe(true);
      expect(continueAgent?.configPath).toContain('.continue');
    });

    it('returns exists=false for missing agents', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const agents = detectAgents();

      for (const agent of agents) {
        expect(agent.exists).toBe(false);
      }
    });

    it('returns all 5 supported agent types', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const agents = detectAgents();
      const types = agents.map((a) => a.type);

      expect(types).toContain('claude-desktop');
      expect(types).toContain('cursor');
      expect(types).toContain('opencode');
      expect(types).toContain('windsurf');
      expect(types).toContain('continue');
      expect(agents).toHaveLength(5);
    });
  });

  describe('getAvailableAgents', () => {
    it('returns only agents that exist', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.cursor') || pathStr.includes('.windsurf');
      });

      const available = getAvailableAgents();

      expect(available).toHaveLength(2);
      expect(available.every((a) => a.exists)).toBe(true);
    });

    it('returns empty array if no agents exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const available = getAvailableAgents();

      expect(available).toHaveLength(0);
    });
  });

  describe('generateServerConfig', () => {
    const options = { accessToken: 'test-token' };

    it('generates correct config for Claude Desktop', () => {
      const config = generateServerConfig('claude-desktop', options);

      expect(config).toEqual({
        command: 'npx',
        args: ['-y', 'fizzy-do-mcp@latest'],
      });
    });

    it('generates correct config for Cursor', () => {
      const config = generateServerConfig('cursor', options);

      expect(config).toEqual({
        command: 'npx',
        args: ['-y', 'fizzy-do-mcp@latest'],
      });
    });

    it('generates correct config for Windsurf', () => {
      const config = generateServerConfig('windsurf', options);

      expect(config).toEqual({
        command: 'npx',
        args: ['-y', 'fizzy-do-mcp@latest'],
      });
    });

    it('generates OpenCode-specific format with type: local', () => {
      const config = generateServerConfig('opencode', options);

      expect(config).toEqual({
        type: 'local',
        command: ['npx', '-y', 'fizzy-do-mcp@latest'],
        enabled: true,
      });
    });

    it('generates Continue-specific format with name field', () => {
      const config = generateServerConfig('continue', options);

      expect(config).toEqual({
        name: 'fizzy',
        command: 'npx',
        args: ['-y', 'fizzy-do-mcp@latest'],
      });
    });
  });

  describe('readAgentConfig', () => {
    it('returns null if config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = readAgentConfig('/path/to/config.json');

      expect(config).toBeNull();
    });

    it('reads and parses valid JSON config', () => {
      const mockConfig = { mcpServers: { fizzy: { command: 'npx' } } };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const config = readAgentConfig('/path/to/config.json');

      expect(config).toEqual(mockConfig);
    });

    it('returns null on invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('not valid json');

      const config = readAgentConfig('/path/to/config.json');

      expect(config).toBeNull();
    });
  });

  describe('writeAgentConfig', () => {
    it('creates directory if it does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      writeAgentConfig('/path/to/config.json', { test: true });

      expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to', { recursive: true });
    });

    it('writes config as formatted JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = { mcpServers: { fizzy: { command: 'npx' } } };
      writeAgentConfig('/path/to/config.json', config);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/config.json',
        JSON.stringify(config, null, 2),
      );
    });
  });

  describe('configureAgent', () => {
    const mockAgent: AgentInfo = {
      type: 'cursor',
      name: 'Cursor',
      description: 'AI-powered code editor',
      configPath: '/home/testuser/.cursor/mcp.json',
      exists: true,
    };

    const options = { accessToken: 'test-token' };

    it('creates new config file if missing', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = configureAgent(mockAgent, options);

      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall?.[1] as string);

      expect(writtenConfig.mcpServers.fizzy).toBeDefined();
      expect(writtenConfig.mcpServers.fizzy.command).toBe('npx');
    });

    it('merges with existing config preserving other servers', () => {
      const existingConfig = {
        mcpServers: {
          other: { command: 'other-server' },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(mockAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall?.[1] as string);

      expect(writtenConfig.mcpServers.other).toBeDefined();
      expect(writtenConfig.mcpServers.fizzy).toBeDefined();
    });

    it('updates existing fizzy entry', () => {
      const existingConfig = {
        mcpServers: {
          fizzy: { command: 'old-command', args: ['old'] },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(mockAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall?.[1] as string);

      expect(writtenConfig.mcpServers.fizzy.command).toBe('npx');
      expect(writtenConfig.mcpServers.fizzy.args).toEqual(['-y', 'fizzy-do-mcp@latest']);
    });

    it('handles Continue array format correctly', () => {
      const continueAgent: AgentInfo = {
        type: 'continue',
        name: 'Continue',
        description: 'AI code assistant',
        configPath: '/home/testuser/.continue/config.json',
        exists: true,
      };

      const existingConfig = {
        mcpServers: [{ name: 'other', command: 'other-command' }],
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(continueAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall?.[1] as string);

      expect(Array.isArray(writtenConfig.mcpServers)).toBe(true);
      expect(writtenConfig.mcpServers).toHaveLength(2);
      expect(
        writtenConfig.mcpServers.find((s: { name: string }) => s.name === 'fizzy'),
      ).toBeDefined();
      expect(
        writtenConfig.mcpServers.find((s: { name: string }) => s.name === 'other'),
      ).toBeDefined();
    });

    it('updates existing fizzy entry in Continue array', () => {
      const continueAgent: AgentInfo = {
        type: 'continue',
        name: 'Continue',
        description: 'AI code assistant',
        configPath: '/home/testuser/.continue/config.json',
        exists: true,
      };

      const existingConfig = {
        mcpServers: [
          { name: 'fizzy', command: 'old-command' },
          { name: 'other', command: 'other-command' },
        ],
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingConfig));

      configureAgent(continueAgent, options);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall?.[1] as string);

      expect(writtenConfig.mcpServers).toHaveLength(2);
      const fizzyServer = writtenConfig.mcpServers.find(
        (s: { name: string }) => s.name === 'fizzy',
      );
      expect(fizzyServer.command).toBe('npx');
    });
  });

  describe('isAgentConfigured', () => {
    it('returns true when fizzy is configured', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'AI-powered code editor',
        configPath: '/home/testuser/.cursor/mcp.json',
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: { fizzy: { command: 'npx' } },
        }),
      );

      expect(isAgentConfigured(agent)).toBe(true);
    });

    it('returns false for unconfigured agent', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'AI-powered code editor',
        configPath: '/home/testuser/.cursor/mcp.json',
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: { other: { command: 'other' } },
        }),
      );

      expect(isAgentConfigured(agent)).toBe(false);
    });

    it('returns false when config file does not exist', () => {
      const agent: AgentInfo = {
        type: 'cursor',
        name: 'Cursor',
        description: 'AI-powered code editor',
        configPath: '/home/testuser/.cursor/mcp.json',
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(isAgentConfigured(agent)).toBe(false);
    });

    it('handles Continue array format', () => {
      const agent: AgentInfo = {
        type: 'continue',
        name: 'Continue',
        description: 'AI code assistant',
        configPath: '/home/testuser/.continue/config.json',
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: [{ name: 'fizzy', command: 'npx' }],
        }),
      );

      expect(isAgentConfigured(agent)).toBe(true);
    });

    it('returns false for Continue without fizzy in array', () => {
      const agent: AgentInfo = {
        type: 'continue',
        name: 'Continue',
        description: 'AI code assistant',
        configPath: '/home/testuser/.continue/config.json',
        exists: true,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: [{ name: 'other', command: 'other' }],
        }),
      );

      expect(isAgentConfigured(agent)).toBe(false);
    });
  });
});

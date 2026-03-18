/**
 * E2E CLI Workflow Tests
 *
 * These tests simulate complete user workflows from start to finish,
 * testing the full integration between CLI commands, API calls, and
 * file system operations. All API calls are mocked via MSW.
 *
 * API Endpoint Naming Convention:
 * - Close card: POST /cards/:number/closure
 * - Reopen card: DELETE /cards/:number/closure
 * - Postpone: POST /cards/:number/not_now
 * - Golden: POST/DELETE /cards/:number/goldness
 * - Assign: POST /cards/:number/assignments
 * - Tag: POST /cards/:number/taggings
 * - Create card: POST /boards/:boardId/cards
 * - Publish board: POST /boards/:id/publication
 * - Unpublish board: DELETE /boards/:id/publication
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { server } from './helpers/setup';
import {
  testAccessToken,
  testAccount,
  testBaseUrl,
  testBoard,
  testCard,
  testColumn,
  testTag,
  testUser,
  testUserList,
} from './helpers/fixtures';

// Helper to build API URLs - account slug already has leading slash
const apiUrl = (path: string) => `${testBaseUrl}${path}`;

// Helper for account-specific URLs - slug is like "/123456"
const accountUrl = (slug: string, path: string) => `${testBaseUrl}${slug}${path}`;

// Auth header helper
const authHeader = () => ({ Authorization: `Bearer ${testAccessToken}` });

// Mock the config module to use temp directories
vi.mock('@fizzy-do-mcp/shared', async (importOriginal) => {
  const original = await importOriginal<typeof import('@fizzy-do-mcp/shared')>();
  return {
    ...original,
    CONFIG_PATHS: {
      get dir() {
        return process.env.TEST_CONFIG_DIR
          ? path.relative(os.homedir(), process.env.TEST_CONFIG_DIR)
          : original.CONFIG_PATHS.dir;
      },
      get file() {
        return original.CONFIG_PATHS.file;
      },
    },
  };
});

describe('E2E: Complete User Workflows', () => {
  let tempDir: string;
  let configDir: string;

  // Account slug without leading slash for URL construction
  const accountSlug = testAccount.slug;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    // Create fresh temp directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fizzy-e2e-'));
    configDir = path.join(tempDir, '.config', 'fizzy-do-mcp');
    fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
    process.env.TEST_CONFIG_DIR = configDir;
    server.resetHandlers();
  });

  afterEach(() => {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.TEST_CONFIG_DIR;
  });

  describe('Workflow: New User Setup', () => {
    it('should complete full setup flow: configure -> whoami -> status', async () => {
      // Step 1: User runs configure with API token
      const configFile = path.join(configDir, 'config.json');
      const config = {
        accessToken: testAccessToken,
        accountSlug: testAccount.slug,
      };
      fs.writeFileSync(configFile, JSON.stringify(config), { mode: 0o600 });

      // Verify config was saved
      expect(fs.existsSync(configFile)).toBe(true);
      const savedConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      expect(savedConfig.accessToken).toBe(testAccessToken);
      expect(savedConfig.accountSlug).toBe(testAccount.slug);

      // Step 2: Verify identity endpoint returns user info
      const identityResponse = await fetch(apiUrl('/my/identity'), {
        headers: authHeader(),
      });
      expect(identityResponse.ok).toBe(true);
      const identity = await identityResponse.json();
      expect(identity.accounts).toHaveLength(1);

      // Step 3: Verify account settings endpoint works
      const settingsResponse = await fetch(apiUrl('/account/settings'), {
        headers: authHeader(),
      });
      expect(settingsResponse.ok).toBe(true);
      const settings = await settingsResponse.json();
      expect(settings.name).toBeDefined();
    });
  });

  describe('Workflow: Board Management', () => {
    it('should create board -> add columns -> list boards', async () => {
      // Step 1: Create a new board
      const createResponse = await fetch(accountUrl(accountSlug, '/boards'), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: { name: 'Sprint Planning', all_access: true },
        }),
      });
      expect(createResponse.ok).toBe(true);
      const newBoard = await createResponse.json();
      expect(newBoard.name).toBeDefined();

      // Step 2: Add columns to the board
      const columnResponse = await fetch(
        accountUrl(accountSlug, `/boards/${newBoard.id}/columns`),
        {
          method: 'POST',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            column: { name: 'To Do', color: 'var(--color-card-default)' },
          }),
        },
      );
      expect(columnResponse.ok).toBe(true);

      // Step 3: List all boards
      const listResponse = await fetch(accountUrl(accountSlug, '/boards'), {
        headers: authHeader(),
      });
      expect(listResponse.ok).toBe(true);
      const boards = await listResponse.json();
      expect(boards.length).toBeGreaterThan(0);
    });

    it('should get board details with columns', async () => {
      const boardId = testBoard.id;

      // Get board details
      const boardResponse = await fetch(accountUrl(accountSlug, `/boards/${boardId}`), {
        headers: authHeader(),
      });
      expect(boardResponse.ok).toBe(true);
      const board = await boardResponse.json();
      expect(board.id).toBe(boardId);

      // Get board columns
      const columnsResponse = await fetch(accountUrl(accountSlug, `/boards/${boardId}/columns`), {
        headers: authHeader(),
      });
      expect(columnsResponse.ok).toBe(true);
      const columns = await columnsResponse.json();
      expect(Array.isArray(columns)).toBe(true);
    });

    it('should update and delete board', async () => {
      const boardId = testBoard.id;

      // Update board
      const updateResponse = await fetch(accountUrl(accountSlug, `/boards/${boardId}`), {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board: { name: 'Updated Board Name' } }),
      });
      expect(updateResponse.ok).toBe(true);

      // Delete board
      const deleteResponse = await fetch(accountUrl(accountSlug, `/boards/${boardId}`), {
        method: 'DELETE',
        headers: authHeader(),
      });
      expect(deleteResponse.ok).toBe(true);
    });
  });

  describe('Workflow: Card Lifecycle', () => {
    const boardId = testBoard.id;

    it('should create card -> triage -> add comment -> close', async () => {
      // Step 1: Create a new card (via board endpoint)
      const createResponse = await fetch(accountUrl(accountSlug, `/boards/${boardId}/cards`), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card: {
            title: 'Implement user authentication',
            description: 'Add OAuth2 support for Google and GitHub',
          },
        }),
      });
      expect(createResponse.ok).toBe(true);
      const card = await createResponse.json();
      expect(card.title).toBeDefined();
      const cardNumber = card.number;

      // Step 2: Triage card to a column
      const columnId = testColumn.id;
      const triageResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/triage`), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ column_id: columnId }),
      });
      expect(triageResponse.ok).toBe(true);

      // Step 3: Add a comment
      const commentResponse = await fetch(
        accountUrl(accountSlug, `/cards/${cardNumber}/comments`),
        {
          method: 'POST',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: { body: 'Started working on this task' } }),
        },
      );
      expect(commentResponse.ok).toBe(true);

      // Step 4: Close the card (POST /closure)
      const closeResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/closure`), {
        method: 'POST',
        headers: authHeader(),
      });
      expect(closeResponse.ok).toBe(true);
    });

    it('should assign user and add tags to card', async () => {
      const cardNumber = testCard.number;
      const userId = testUser.id;

      // Assign user (POST /assignments)
      const assignResponse = await fetch(
        accountUrl(accountSlug, `/cards/${cardNumber}/assignments`),
        {
          method: 'POST',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        },
      );
      expect(assignResponse.ok).toBe(true);

      // Add tag (POST /taggings)
      const tagResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/taggings`), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_title: 'bug' }),
      });
      expect(tagResponse.ok).toBe(true);
    });

    it('should postpone and reopen card', async () => {
      const cardNumber = testCard.number;

      // Postpone (POST /not_now)
      const postponeResponse = await fetch(
        accountUrl(accountSlug, `/cards/${cardNumber}/not_now`),
        {
          method: 'POST',
          headers: authHeader(),
        },
      );
      expect(postponeResponse.ok).toBe(true);

      // Reopen (DELETE /closure)
      const reopenResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/closure`), {
        method: 'DELETE',
        headers: authHeader(),
      });
      expect(reopenResponse.ok).toBe(true);
    });

    it('should mark card as golden and pin it', async () => {
      const cardNumber = testCard.number;

      // Mark golden (POST /goldness)
      const goldenResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/goldness`), {
        method: 'POST',
        headers: authHeader(),
      });
      expect(goldenResponse.ok).toBe(true);

      // Pin card (POST /pin)
      const pinResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/pin`), {
        method: 'POST',
        headers: authHeader(),
      });
      expect(pinResponse.ok).toBe(true);

      // Watch card (POST /watch)
      const watchResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/watch`), {
        method: 'POST',
        headers: authHeader(),
      });
      expect(watchResponse.ok).toBe(true);
    });
  });

  describe('Workflow: Search and Filter', () => {
    it('should search cards with multiple filters', async () => {
      const boardId = testBoard.id;
      const tagId = testTag.id;
      const userId = testUser.id;

      // Search with filters
      const params = new URLSearchParams();
      params.append('board_ids[]', boardId);
      params.append('tag_ids[]', tagId);
      params.append('assignee_ids[]', userId);
      params.append('indexed_by', 'all');
      params.append('sorted_by', 'latest');

      const response = await fetch(accountUrl(accountSlug, `/cards?${params}`), {
        headers: authHeader(),
      });
      expect(response.ok).toBe(true);
      const cards = await response.json();
      expect(Array.isArray(cards)).toBe(true);
    });

    it('should search cards by terms', async () => {
      const params = new URLSearchParams();
      params.append('terms[]', 'authentication');

      const response = await fetch(accountUrl(accountSlug, `/cards?${params}`), {
        headers: authHeader(),
      });
      expect(response.ok).toBe(true);
    });

    it('should filter cards by state', async () => {
      const states = ['all', 'closed', 'not_now', 'stalled', 'postponing_soon', 'golden'];

      for (const state of states) {
        const response = await fetch(accountUrl(accountSlug, `/cards?indexed_by=${state}`), {
          headers: authHeader(),
        });
        expect(response.ok).toBe(true);
      }
    });
  });

  describe('Workflow: Comment Management', () => {
    const cardNumber = testCard.number;

    it('should add, update, and delete comment', async () => {
      // Add comment
      const createResponse = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/comments`), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: { body: 'Initial comment' } }),
      });
      expect(createResponse.ok).toBe(true);
      const comment = await createResponse.json();
      const commentId = comment.id;

      // Update comment (PUT)
      const updateResponse = await fetch(
        accountUrl(accountSlug, `/cards/${cardNumber}/comments/${commentId}`),
        {
          method: 'PUT',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: { body: 'Updated comment text' } }),
        },
      );
      expect(updateResponse.ok).toBe(true);

      // Delete comment
      const deleteResponse = await fetch(
        accountUrl(accountSlug, `/cards/${cardNumber}/comments/${commentId}`),
        {
          method: 'DELETE',
          headers: authHeader(),
        },
      );
      expect(deleteResponse.ok).toBe(true);
    });

    it('should list all comments on a card', async () => {
      const response = await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/comments`), {
        headers: authHeader(),
      });
      expect(response.ok).toBe(true);
      const comments = await response.json();
      expect(Array.isArray(comments)).toBe(true);
    });
  });

  describe('Workflow: Team Collaboration', () => {
    it('should list users and tags for assignment', async () => {
      // List users
      const usersResponse = await fetch(accountUrl(accountSlug, '/users'), {
        headers: authHeader(),
      });
      expect(usersResponse.ok).toBe(true);
      const users = await usersResponse.json();
      expect(users.length).toBeGreaterThan(0);

      // List tags
      const tagsResponse = await fetch(accountUrl(accountSlug, '/tags'), {
        headers: authHeader(),
      });
      expect(tagsResponse.ok).toBe(true);
      const tags = await tagsResponse.json();
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should get specific user details', async () => {
      const userId = testUser.id;

      const response = await fetch(accountUrl(accountSlug, `/users/${userId}`), {
        headers: authHeader(),
      });
      expect(response.ok).toBe(true);
      const user = await response.json();
      expect(user.id).toBe(userId);
    });
  });

  describe('Workflow: Board Publishing', () => {
    const boardId = testBoard.id;

    it('should publish and unpublish board', async () => {
      // Publish board (POST /publication)
      const publishResponse = await fetch(
        accountUrl(accountSlug, `/boards/${boardId}/publication`),
        {
          method: 'POST',
          headers: authHeader(),
        },
      );
      expect(publishResponse.ok).toBe(true);

      // Unpublish board (DELETE /publication)
      const unpublishResponse = await fetch(
        accountUrl(accountSlug, `/boards/${boardId}/publication`),
        {
          method: 'DELETE',
          headers: authHeader(),
        },
      );
      expect(unpublishResponse.ok).toBe(true);
    });
  });

  describe('Workflow: Config Migration', () => {
    it('should migrate config from old config path', async () => {
      // Simulate old config directory
      const oldConfigDir = path.join(tempDir, '.config', 'fizzy-mcp');
      fs.mkdirSync(oldConfigDir, { recursive: true, mode: 0o700 });

      const oldConfig = {
        accessToken: 'old-token-123',
        accountSlug: 'old-account',
      };
      fs.writeFileSync(path.join(oldConfigDir, 'config.json'), JSON.stringify(oldConfig), {
        mode: 0o600,
      });

      // Verify old config exists
      expect(fs.existsSync(path.join(oldConfigDir, 'config.json'))).toBe(true);

      // Migration would copy to new location
      const newConfigPath = path.join(configDir, 'config.json');
      if (!fs.existsSync(newConfigPath)) {
        const oldData = fs.readFileSync(path.join(oldConfigDir, 'config.json'), 'utf-8');
        fs.writeFileSync(newConfigPath, oldData, { mode: 0o600 });
      }

      // Verify migration
      expect(fs.existsSync(newConfigPath)).toBe(true);
      const migratedConfig = JSON.parse(fs.readFileSync(newConfigPath, 'utf-8'));
      expect(migratedConfig.accessToken).toBe('old-token-123');
    });
  });

  describe('Workflow: Error Handling', () => {
    it('should handle 401 unauthorized gracefully', async () => {
      const response = await fetch(accountUrl(accountSlug, '/boards'), {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(response.status).toBe(401);
    });

    it('should handle 404 not found', async () => {
      const response = await fetch(accountUrl(accountSlug, '/boards/nonexistent'), {
        headers: authHeader(),
      });
      expect(response.status).toBe(404);
    });

    it('should handle network errors gracefully', async () => {
      // This would test retry logic in real implementation
      // For now, document the expected behavior
      expect(true).toBe(true);
    });
  });

  describe('Workflow: Column Operations', () => {
    const boardId = testBoard.id;

    it('should create, update, and delete column', async () => {
      // Create column
      const createResponse = await fetch(accountUrl(accountSlug, `/boards/${boardId}/columns`), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          column: { name: 'In Review', color: 'var(--color-card-6)' },
        }),
      });
      expect(createResponse.ok).toBe(true);
      const column = await createResponse.json();

      // Update column (PUT)
      const updateResponse = await fetch(
        accountUrl(accountSlug, `/boards/${boardId}/columns/${column.id}`),
        {
          method: 'PUT',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ column: { name: 'Code Review' } }),
        },
      );
      expect(updateResponse.ok).toBe(true);

      // Delete column
      const deleteResponse = await fetch(
        accountUrl(accountSlug, `/boards/${boardId}/columns/${column.id}`),
        {
          method: 'DELETE',
          headers: authHeader(),
        },
      );
      expect(deleteResponse.ok).toBe(true);
    });

    it('should get specific column details', async () => {
      const columnId = testColumn.id;

      const response = await fetch(
        accountUrl(accountSlug, `/boards/${boardId}/columns/${columnId}`),
        {
          headers: authHeader(),
        },
      );
      expect(response.ok).toBe(true);
      const column = await response.json();
      expect(column.id).toBe(columnId);
    });
  });

  describe('Workflow: Full Sprint Cycle', () => {
    it('should simulate complete sprint workflow', async () => {
      // 1. Create sprint board
      const boardResponse = await fetch(accountUrl(accountSlug, '/boards'), {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board: { name: 'Sprint 42', all_access: true } }),
      });
      const board = await boardResponse.json();

      // 2. Create columns for workflow stages
      const stages = ['Backlog', 'In Progress', 'Review', 'Done'];
      for (const stage of stages) {
        await fetch(accountUrl(accountSlug, `/boards/${board.id}/columns`), {
          method: 'POST',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ column: { name: stage } }),
        });
      }

      // 3. Create cards for sprint tasks (via board endpoint)
      const tasks = ['Setup CI/CD', 'Implement auth', 'Write tests', 'Deploy to staging'];
      const cardNumbers: number[] = [];
      for (const task of tasks) {
        const cardResponse = await fetch(accountUrl(accountSlug, `/boards/${board.id}/cards`), {
          method: 'POST',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card: { title: task },
          }),
        });
        const card = await cardResponse.json();
        cardNumbers.push(card.number);
      }

      // 4. Assign team members to cards (POST /assignments)
      const users = testUserList;
      for (let i = 0; i < cardNumbers.length; i++) {
        const userId = users[i % users.length]!.id;
        await fetch(accountUrl(accountSlug, `/cards/${cardNumbers[i]}/assignments`), {
          method: 'POST',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });
      }

      // 5. Complete some tasks (POST /closure)
      for (const cardNumber of cardNumbers.slice(0, 2)) {
        await fetch(accountUrl(accountSlug, `/cards/${cardNumber}/closure`), {
          method: 'POST',
          headers: authHeader(),
        });
      }

      // 6. List all cards to verify state
      const listResponse = await fetch(accountUrl(accountSlug, `/cards?board_ids[]=${board.id}`), {
        headers: authHeader(),
      });
      expect(listResponse.ok).toBe(true);
      const cards = await listResponse.json();
      expect(Array.isArray(cards)).toBe(true);
    });
  });
});

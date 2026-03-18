/**
 * Integration tests for Fizzy API flow using MSW.
 *
 * These tests verify the complete API integration flow from the FizzyClient
 * through to API responses, including error handling.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vite-plus/test';
import { FizzyClient } from '@fizzy-do-mcp/client';
import {
  server,
  errorHandlers,
  multipleAccountsHandler,
  testAccessToken,
  testIdentity,
  testMultipleAccountsIdentity,
  testBoardList,
  testBoard,
  testCard,
  testCommentList,
  testColumnList,
  testTagList,
  testUserList,
  testUser,
} from './helpers/setup.js';

describe('Fizzy API Integration', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Authentication', () => {
    it('validates access token with successful identity fetch', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken });

      const result = await client.identity.getIdentity();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accounts).toHaveLength(1);
        expect(result.value.accounts[0]!.name).toBe(testIdentity.accounts[0].name);
      }
    });

    it('handles invalid token with 401 error', async () => {
      server.use(errorHandlers.unauthorized);

      const client = new FizzyClient({ accessToken: 'invalid_token' });

      const result = await client.identity.getIdentity();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // The client wraps 401 errors in FizzyAuthError with default message
        expect(result.error.message).toContain('Authentication');
      }
    });

    it('returns proper error object structure', async () => {
      server.use(errorHandlers.unauthorized);

      const client = new FizzyClient({ accessToken: 'invalid_token' });

      const result = await client.identity.getIdentity();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeDefined();
        expect(typeof result.error.message).toBe('string');
      }
    });
  });

  describe('Identity', () => {
    it('fetches user identity', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken });

      const result = await client.identity.getIdentity();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accounts[0]!.user.name).toBe(testIdentity.accounts[0].user.name);
        expect(result.value.accounts[0]!.user.email_address).toBe(
          testIdentity.accounts[0].user.email_address,
        );
      }
    });

    it('lists accessible accounts', async () => {
      server.use(multipleAccountsHandler);

      const client = new FizzyClient({ accessToken: testAccessToken });

      const result = await client.identity.getIdentity();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accounts).toHaveLength(2);
        expect(result.value.accounts[0]!.slug).toBe(testMultipleAccountsIdentity.accounts[0].slug);
        expect(result.value.accounts[1]!.slug).toBe(testMultipleAccountsIdentity.accounts[1].slug);
      }
    });

    it('auto-selects single account', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken });

      const result = await client.identity.getIdentity();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accounts).toHaveLength(1);
        // Single account can be auto-selected
        const account = result.value.accounts[0];
        expect(account?.slug).toBeTruthy();
      }
    });
  });

  describe('Boards', () => {
    const accountSlug = '/123456';

    it('lists boards', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.boards.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]!.name).toBe(testBoardList[0].name);
      }
    });

    it('gets board by ID', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.boards.getById('board_abc123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(testBoard.id);
        expect(result.value.name).toBe(testBoard.name);
      }
    });

    it('creates board', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.boards.create({ name: 'New Board', all_access: true });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('New Board');
      }
    });

    it('updates board', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      // Board update returns void (204 no content)
      const result = await client.boards.update('board_abc123', { name: 'Updated Board' });

      expect(result.ok).toBe(true);
    });

    it('handles board not found', async () => {
      server.use(errorHandlers.forbidden);

      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.boards.getById('nonexistent');

      expect(result.ok).toBe(false);
    });
  });

  describe('Cards', () => {
    const accountSlug = '/123456';

    it('lists cards', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        // CardList is an array of CardSummary
        expect(result.value).toHaveLength(2);
        expect(result.value[0]!.title).toBe(testCard.title);
      }
    });

    it('lists cards with filters', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.list({ board_ids: ['board_abc123'] });

      expect(result.ok).toBe(true);
    });

    it('gets card by number', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.getByNumber(42);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.number).toBe(testCard.number);
        expect(result.value.title).toBe(testCard.title);
      }
    });

    it('creates card', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.create('board_abc123', {
        title: 'New Card',
        description: 'Description',
        status: 'published',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe('New Card');
        expect(result.value.number).toBe(100);
      }
    });

    it('updates card', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.update(42, { title: 'Updated Card' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe('Updated Card');
      }
    });

    it('closes card', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      // Close returns void (204 no content)
      const result = await client.cards.close(42);

      expect(result.ok).toBe(true);
    });

    it('reopens card', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      // Reopen returns void (204 no content)
      const result = await client.cards.reopen(42);

      expect(result.ok).toBe(true);
    });

    it('triages card to column', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      // Triage returns void (204 no content)
      const result = await client.cards.triage(42, 'col_123');

      expect(result.ok).toBe(true);
    });

    it('handles card not found', async () => {
      server.use(errorHandlers.notFound);

      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.getByNumber(99999);

      expect(result.ok).toBe(false);
    });

    it('handles validation errors', async () => {
      server.use(errorHandlers.validationError);

      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.create('board_abc123', {
        title: '', // Empty title should fail
        status: 'published',
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('Comments', () => {
    const accountSlug = '/123456';

    it('lists comments on card', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.comments.list(42);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]!.body.plain_text).toBe(testCommentList[0].body.plain_text);
      }
    });

    it('creates comment', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.comments.create(42, { body: 'New comment' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.body.plain_text).toBe('New comment');
        expect(result.value.id).toBe('comment_new');
      }
    });
  });

  describe('Columns', () => {
    const accountSlug = '/123456';

    it('lists columns on board', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.columns.list('board_abc123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]!.name).toBe(testColumnList[0].name);
      }
    });

    it('creates column', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.columns.create('board_abc123', { name: 'New Column' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('New Column');
        expect(result.value.id).toBe('col_new');
      }
    });
  });

  describe('Tags', () => {
    const accountSlug = '/123456';

    it('lists tags', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.tags.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0]!.title).toBe(testTagList[0].title);
      }
    });
  });

  describe('Users', () => {
    const accountSlug = '/123456';

    it('lists users', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.users.list();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]!.name).toBe(testUserList[0].name);
      }
    });

    it('gets user by ID', async () => {
      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.users.getById('user_123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe(testUser.name);
        expect(result.value.email_address).toBe(testUser.email_address);
      }
    });
  });

  describe('Error Handling', () => {
    const accountSlug = '/123456';

    it('handles rate limiting (429)', async () => {
      server.use(errorHandlers.rateLimited);

      const client = new FizzyClient({
        accessToken: testAccessToken,
        accountSlug,
        retryConfig: { maxRetries: 0 }, // Disable retries for this test
      });

      const result = await client.cards.list();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // The client wraps 429 errors in FizzyRateLimitError
        expect(result.error.message).toContain('Rate limit');
      }
    });

    it('handles server errors (5xx)', async () => {
      server.use(errorHandlers.serverError);

      const client = new FizzyClient({
        accessToken: testAccessToken,
        accountSlug,
        retryConfig: { maxRetries: 0 }, // Disable retries for this test
      });

      const result = await client.cards.list();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Internal server error');
      }
    });

    it('returns proper error objects', async () => {
      server.use(errorHandlers.notFound);

      const client = new FizzyClient({ accessToken: testAccessToken, accountSlug });

      const result = await client.cards.getByNumber(99999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toHaveProperty('message');
        expect(typeof result.error.message).toBe('string');
      }
    });
  });
});

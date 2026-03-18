/**
 * Test fixtures for Fizzy MCP tests.
 *
 * These fixtures match the Zod schemas defined in @fizzy-do-mcp/shared.
 * Run `grep -r "Schema = z.object" packages/shared/src/schemas/` to see all schemas.
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Test user data (matches UserSchema from common.ts)
 * Required: id, name, role, active, email_address, created_at, url
 * Optional: avatar_url
 */
export const testUser = {
  id: 'user_123',
  name: 'Test User',
  role: 'admin' as const,
  active: true,
  email_address: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  url: 'https://app.fizzy.do/123456/users/user_123',
  avatar_url: 'https://example.com/avatar.png',
} as const;

/**
 * Test column color (matches ColumnColorSchema)
 * Required: name, value
 */
export const testColumnColor = {
  name: 'Blue',
  value: 'var(--color-card-default)',
} as const;

// ============================================================================
// Identity & Account
// ============================================================================

/**
 * Test account data (matches AccountSchema from identity.ts)
 * Required: id, name, slug, created_at, user
 */
export const testAccount = {
  id: 'account_123456',
  name: 'Test Account',
  slug: '/123456',
  created_at: '2024-01-01T00:00:00Z',
  user: testUser,
} as const;

/**
 * Test identity response (matches IdentityResponseSchema)
 */
export const testIdentity = {
  accounts: [testAccount],
} as const;

/**
 * Multiple accounts identity response
 */
export const testMultipleAccountsIdentity = {
  accounts: [
    testAccount,
    {
      id: 'account_789012',
      name: 'Second Account',
      slug: '/789012',
      created_at: '2024-01-01T00:00:00Z',
      user: testUser,
    },
  ],
} as const;

// ============================================================================
// Boards
// ============================================================================

/**
 * Test board data (matches BoardSchema)
 * Required: id, name, all_access, created_at, auto_postpone_period_in_days, url, creator
 * Optional: public_url
 */
export const testBoard = {
  id: 'board_abc123',
  name: 'Engineering',
  all_access: true,
  created_at: '2024-01-01T00:00:00Z',
  auto_postpone_period_in_days: 14,
  url: 'https://app.fizzy.do/123456/boards/board_abc123',
  creator: testUser,
} as const;

/**
 * Test board list (matches BoardListSchema - array of Board)
 */
export const testBoardList = [
  testBoard,
  {
    id: 'board_def456',
    name: 'Personal',
    all_access: true,
    created_at: '2024-01-01T00:00:00Z',
    auto_postpone_period_in_days: null,
    url: 'https://app.fizzy.do/123456/boards/board_def456',
    creator: testUser,
  },
] as const;

/**
 * Test board summary (matches BoardSummarySchema - embedded in cards)
 */
export const testBoardSummary = {
  id: 'board_abc123',
  name: 'Engineering',
  all_access: true,
  created_at: '2024-01-01T00:00:00Z',
  auto_postpone_period_in_days: 14,
  url: 'https://app.fizzy.do/123456/boards/board_abc123',
  creator: testUser,
} as const;

// ============================================================================
// Columns
// ============================================================================

/**
 * Test column data (matches ColumnSchema)
 * Required: id, name, color (object with name/value), created_at
 */
export const testColumn = {
  id: 'col_123',
  name: 'In Progress',
  color: testColumnColor,
  created_at: '2024-01-01T00:00:00Z',
} as const;

/**
 * Test column list (matches ColumnListSchema)
 */
export const testColumnList = [
  testColumn,
  {
    id: 'col_456',
    name: 'Done',
    color: { name: 'Lime', value: 'var(--color-card-4)' },
    created_at: '2024-01-01T00:00:00Z',
  },
] as const;

// ============================================================================
// Cards
// ============================================================================

/**
 * Test card data (matches CardSummarySchema)
 * Required: id, number, title, status, description, description_html, image_url,
 *           has_attachments, tags, golden, last_active_at, created_at, url,
 *           board (BoardSummary), creator, comments_url
 * Optional: assignees, reactions_url
 */
export const testCard = {
  id: 'card_xyz789',
  number: 42,
  title: 'Fix bug in login',
  status: 'published' as const,
  description: 'Users report login issues on mobile',
  description_html: '<p>Users report login issues on mobile</p>',
  image_url: null,
  has_attachments: false,
  tags: [] as string[],
  golden: false,
  last_active_at: '2024-01-02T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  url: 'https://app.fizzy.do/123456/cards/42',
  board: testBoardSummary,
  creator: testUser,
  comments_url: 'https://app.fizzy.do/123456/cards/42/comments',
  assignees: [] as (typeof testUser)[],
} as const;

/**
 * Test card list (CardList is an array of CardSummary)
 */
export const testCardList = [
  testCard,
  {
    ...testCard,
    id: 'card_abc456',
    number: 43,
    title: 'Add dark mode support',
    url: 'https://app.fizzy.do/123456/cards/43',
    comments_url: 'https://app.fizzy.do/123456/cards/43/comments',
  },
] as const;

/**
 * Test card with column (matches CardSchema - detail view)
 * Extends CardSummary with optional: closed, column, steps
 */
export const testCardWithColumn = {
  ...testCard,
  closed: false,
  column: testColumn,
} as const;

// ============================================================================
// Comments
// ============================================================================

/**
 * Test comment body (matches CommentBodySchema)
 * Required: plain_text, html
 */
export const testCommentBody = {
  plain_text: 'This looks good!',
  html: '<p>This looks good!</p>',
} as const;

/**
 * Test card reference for comments (matches CommentCardRefSchema)
 */
export const testCommentCardRef = {
  id: 'card_xyz789',
  url: 'https://app.fizzy.do/123456/cards/42',
} as const;

/**
 * Test comment data (matches CommentSchema)
 * Required: id, created_at, updated_at, body (object), creator, card, reactions_url, url
 */
export const testComment = {
  id: 'comment_123',
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-01T12:00:00Z',
  body: testCommentBody,
  creator: testUser,
  card: testCommentCardRef,
  reactions_url: 'https://app.fizzy.do/123456/cards/42/comments/comment_123/reactions',
  url: 'https://app.fizzy.do/123456/cards/42/comments/comment_123',
} as const;

/**
 * Test comment list (matches CommentListSchema)
 */
export const testCommentList = [
  testComment,
  {
    id: 'comment_456',
    created_at: '2024-01-02T12:00:00Z',
    updated_at: '2024-01-02T12:00:00Z',
    body: { plain_text: 'Approved for merge', html: '<p>Approved for merge</p>' },
    creator: testUser,
    card: testCommentCardRef,
    reactions_url: 'https://app.fizzy.do/123456/cards/42/comments/comment_456/reactions',
    url: 'https://app.fizzy.do/123456/cards/42/comments/comment_456',
  },
] as const;

// ============================================================================
// Tags
// ============================================================================

/**
 * Test tag data (matches TagSchema)
 * Required: id, title, created_at, url
 */
export const testTag = {
  id: 'tag_123',
  title: 'bug',
  created_at: '2024-01-01T00:00:00Z',
  url: 'https://app.fizzy.do/123456/tags/tag_123',
} as const;

/**
 * Test tag list (matches TagListSchema)
 */
export const testTagList = [
  testTag,
  {
    id: 'tag_456',
    title: 'feature',
    created_at: '2024-01-01T00:00:00Z',
    url: 'https://app.fizzy.do/123456/tags/tag_456',
  },
  {
    id: 'tag_789',
    title: 'urgent',
    created_at: '2024-01-01T00:00:00Z',
    url: 'https://app.fizzy.do/123456/tags/tag_789',
  },
] as const;

// ============================================================================
// Users
// ============================================================================

/**
 * Test user list (array of User - matches UserListSchema)
 */
export const testUserList = [
  testUser,
  {
    id: 'user_456',
    name: 'Another User',
    role: 'member' as const,
    active: true,
    email_address: 'another@example.com',
    created_at: '2024-01-01T00:00:00Z',
    url: 'https://app.fizzy.do/123456/users/user_456',
  },
] as const;

// ============================================================================
// Test Tokens & URLs
// ============================================================================

/**
 * Test access token
 */
export const testAccessToken = 'test_access_token_12345';

/**
 * Test invalid access token
 */
export const testInvalidToken = 'invalid_token';

/**
 * Test API base URL
 */
export const testBaseUrl = 'https://app.fizzy.do';

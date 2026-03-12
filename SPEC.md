# Fizzy MCP Server - Specification

## Goal

Create a high-quality, production-ready MCP (Model Context Protocol) server for Fizzy (Basecamp's task management tool) that allows AI agents to interact with the Fizzy API.

## Requirements

- Written in idiomatic TypeScript
- Use pnpm workspace monorepo with Turborepo
- Cloudflare Workers compatible (no native dependencies)
- Use dependency injection for extensibility
- Have robust error handling with Result types
- Include comprehensive documentation
- Support local stdio transport and HTTP transport for CF Workers

## Design Decisions

- Based on Fizzy API docs: https://github.com/basecamp/fizzy/blob/main/docs/API.md
- Use `@fizzy-mcp/*` scoped package names for internal packages
- Published to npm as `fizzy-do-mcp` (unscoped)
- Use oxlint for linting (added to root package.json)
- Store credentials in plain text config file (`~/.config/fizzy-mcp/config.json`) with mode 600
- Auto-detect account slug from identity endpoint on first run
- Prefix all MCP tools with `fizzy_` (e.g., `fizzy_list_cards`)
- Implement retry with exponential backoff for rate limits (429) and server errors
- Environment variables take precedence over config file for credentials
- Auto-convert Markdown to HTML for card descriptions and comment bodies

## Discoveries

- MCP SDK uses `@modelcontextprotocol/sdk` package with `McpServer` class and `server.tool()` method for registering tools
- `exactOptionalPropertyTypes` in tsconfig causes issues with optional params - need to use spread operator or explicit undefined checks
- Fizzy API uses Bearer token auth, returns JSON, supports ETags for caching
- Card numbers are used for referencing cards (not IDs) in most endpoints
- Identity endpoint (`/my/identity`) doesn't require account slug and returns list of accessible accounts
- Identity response structure: `{ accounts: [{ name, id, slug, user: { name, email_address, ... } }] }` - user info is nested under each account
- ToolResult type needs `[key: string]: unknown` index signature for MCP SDK compatibility
- Fizzy uses ActionText (Rails) for rich text, accepts standard HTML tags
- Drizzle ORM v0.41.0+ required for better-auth compatibility
- drizzle-kit v0.31.4+ required for D1 migrations
- `WebStandardStreamableHTTPServerTransport` from `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js` works on Cloudflare Workers
- D1 Drizzle initialization: `drizzle(env.DB, { schema })`
- Don't use `.js` extensions in TypeScript imports (bundler handles resolution)
- Wrangler generates `Env` interface in `worker-configuration.d.ts` - define your own if you need to override types

## Project Structure

```
fizzy-mcp/
├── package.json                          # Root package with scripts, oxlint
├── pnpm-workspace.yaml                   # Workspace config
├── turbo.json                            # Turborepo config
├── tsconfig.json                         # Base TypeScript config
├── vitest.config.ts                      # Test config
├── oxlint.json                           # Linting config
├── .prettierrc                           # Formatting config
├── .gitignore
├── .env.example
├── README.md                             # Documentation
├── SPEC.md                               # This file
├── packages/
│   ├── shared/                           # @fizzy-mcp/shared
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── result.ts                 # Result<T,E> type
│   │   │   ├── errors.ts                 # FizzyError hierarchy
│   │   │   ├── config.ts                 # Config types
│   │   │   ├── markdown.ts               # Markdown to HTML conversion
│   │   │   └── schemas/                  # Zod schemas
│   │   │       ├── index.ts
│   │   │       ├── common.ts
│   │   │       ├── identity.ts
│   │   │       ├── boards.ts
│   │   │       ├── cards.ts
│   │   │       ├── columns.ts
│   │   │       ├── comments.ts
│   │   │       ├── tags.ts
│   │   │       ├── users.ts
│   │   │       └── steps.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── client/                           # @fizzy-mcp/client
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts                 # FizzyClient class
│   │   │   ├── http/
│   │   │   │   ├── index.ts
│   │   │   │   ├── types.ts              # HttpClient interface
│   │   │   │   ├── fetch-client.ts       # Fetch implementation
│   │   │   │   └── retry.ts              # Retry with backoff
│   │   │   └── endpoints/
│   │   │       ├── index.ts
│   │   │       ├── base.ts               # BaseEndpoint class
│   │   │       ├── identity.ts
│   │   │       ├── boards.ts
│   │   │       ├── cards.ts
│   │   │       ├── columns.ts
│   │   │       ├── comments.ts
│   │   │       ├── tags.ts
│   │   │       ├── users.ts
│   │   │       └── pins.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── tools/                            # @fizzy-mcp/tools
│       ├── src/
│       │   ├── index.ts
│       │   ├── register.ts               # registerAllTools()
│       │   ├── utils.ts                  # formatToolSuccess/Error helpers
│       │   ├── identity/
│       │   │   ├── tools.ts
│       │   │   └── index.ts
│       │   ├── boards/
│       │   │   ├── tools.ts
│       │   │   └── index.ts
│       │   ├── cards/
│       │   │   ├── tools.ts
│       │   │   └── index.ts
│       │   ├── comments/
│       │   │   ├── tools.ts
│       │   │   └── index.ts
│       │   ├── columns/
│       │   │   ├── tools.ts
│       │   │   └── index.ts
│       │   ├── tags/
│       │   │   ├── tools.ts
│       │   │   └── index.ts
│       │   └── users/
│       │       ├── tools.ts
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── apps/
│   ├── server/                           # fizzy-do-mcp (published to npm)
│   │   ├── src/
│   │   │   ├── index.ts                  # MCP server entry point
│   │   │   ├── cli.ts                    # CLI (auth, whoami, status, logout)
│   │   │   ├── credentials.ts            # Config file management
│   │   │   └── configure/
│   │   │       └── agents.ts             # AI agent auto-configuration
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   └── hosted/                           # Hosted MCP service (Cloudflare Workers)
│       ├── src/
│       │   ├── index.ts                  # Worker entry point
│       │   ├── app.ts                    # Hono app with middleware
│       │   ├── types.ts                  # TypeScript types
│       │   ├── api/                      # REST API routes
│       │   │   ├── index.ts              # API router
│       │   │   ├── health.ts             # Health endpoints
│       │   │   ├── me.ts                 # User endpoints
│       │   │   └── admin/                # Admin endpoints
│       │   │       ├── index.ts
│       │   │       ├── settings.ts
│       │   │       └── stats.ts
│       │   ├── db/                       # Database
│       │   │   ├── index.ts              # Drizzle client factory
│       │   │   └── schema.ts             # D1 schema
│       │   ├── mcp/                      # MCP handling
│       │   │   ├── handler.ts            # MCP route handler
│       │   │   ├── server.ts             # MCP server factory
│       │   │   └── write-operations.ts   # Write op classification
│       │   ├── middleware/               # Hono middleware
│       │   │   ├── fizzy-token.ts        # Token extraction
│       │   │   ├── session.ts            # Session management
│       │   │   └── logging.ts            # Request logging
│       │   └── services/                 # Business logic
│       │       ├── settings.ts           # Settings with caching
│       │       └── usage.ts              # Usage tracking
│       ├── drizzle/                      # Database migrations
│       │   └── *.sql
│       ├── drizzle.config.ts             # Drizzle Kit config
│       ├── wrangler.jsonc                # CF Workers config
│       ├── package.json
│       └── tsconfig.json
└── docs/                                 # Documentation site (Astro Starlight)
    ├── src/content/docs/
    ├── astro.config.mjs
    └── wrangler.jsonc                    # Deployed to fizzy.yogan.dev
```

---

## Current Implementation (40 tools)

### Identity (2 tools)
- `fizzy_get_identity` - Get current user and list accessible accounts
- `fizzy_get_account` - Get account settings

### Boards (7 tools)
- `fizzy_list_boards` - List all boards
- `fizzy_get_board` - Get board by ID
- `fizzy_create_board` - Create new board
- `fizzy_update_board` - Update board
- `fizzy_delete_board` - Delete board
- `fizzy_publish_board` - Publish board (make public)
- `fizzy_unpublish_board` - Unpublish board

### Cards (18 tools)
- `fizzy_list_cards` - List cards with filters
- `fizzy_get_card` - Get card by number
- `fizzy_create_card` - Create card
- `fizzy_update_card` - Update card
- `fizzy_delete_card` - Delete card
- `fizzy_close_card` - Close/complete card
- `fizzy_reopen_card` - Reopen card
- `fizzy_postpone_card` - Move to "Not Now"
- `fizzy_triage_card` - Move to column
- `fizzy_untriage_card` - Remove from column
- `fizzy_tag_card` - Toggle tag
- `fizzy_assign_card` - Toggle assignment
- `fizzy_watch_card` - Subscribe to notifications
- `fizzy_unwatch_card` - Unsubscribe
- `fizzy_pin_card` - Pin card
- `fizzy_unpin_card` - Unpin card
- `fizzy_mark_golden` - Mark as golden
- `fizzy_unmark_golden` - Remove golden status

### Comments (5 tools)
- `fizzy_list_comments` - List comments on card
- `fizzy_get_comment` - Get comment by ID
- `fizzy_create_comment` - Add comment
- `fizzy_update_comment` - Update comment
- `fizzy_delete_comment` - Delete comment

### Columns (5 tools)
- `fizzy_list_columns` - List columns on board
- `fizzy_get_column` - Get column by ID
- `fizzy_create_column` - Create column
- `fizzy_update_column` - Update column
- `fizzy_delete_column` - Delete column

### Tags (1 tool)
- `fizzy_list_tags` - List all tags

### Users (2 tools)
- `fizzy_list_users` - List all users
- `fizzy_get_user` - Get user by ID

---

## Remaining API Endpoints to Implement

### 1. Webhooks (Admin only) - 6 tools

Webhooks notify external applications when events happen on a board.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:account_slug/boards/:board_id/webhooks` | List webhooks for a board |
| GET | `/:account_slug/boards/:board_id/webhooks/:id` | Get a specific webhook |
| POST | `/:account_slug/boards/:board_id/webhooks` | Create a webhook |
| PATCH | `/:account_slug/boards/:board_id/webhooks/:id` | Update a webhook |
| DELETE | `/:account_slug/boards/:board_id/webhooks/:id` | Delete a webhook |
| POST | `/:account_slug/boards/:board_id/webhooks/:id/activation` | Reactivate a webhook |

#### Schema: Webhook

```typescript
interface Webhook {
  id: string;
  name: string;
  payload_url: string;
  active: boolean;
  signing_secret: string;
  subscribed_actions: WebhookAction[];
  created_at: string;
  url: string;
  board: Board;
}

type WebhookAction =
  | 'card_assigned'
  | 'card_closed'
  | 'card_postponed'
  | 'card_auto_postponed'
  | 'card_board_changed'
  | 'card_published'
  | 'card_reopened'
  | 'card_sent_back_to_triage'
  | 'card_triaged'
  | 'card_unassigned'
  | 'comment_created';
```

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_list_webhooks` | List webhooks for a board |
| `fizzy_get_webhook` | Get a specific webhook |
| `fizzy_create_webhook` | Create a new webhook |
| `fizzy_update_webhook` | Update a webhook |
| `fizzy_delete_webhook` | Delete a webhook |
| `fizzy_reactivate_webhook` | Reactivate a deactivated webhook |

---

### 2. Card Reactions (Boosts) - 3 tools

Short responses (max 16 chars) directly on cards.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:account_slug/cards/:card_number/reactions` | List reactions on a card |
| POST | `/:account_slug/cards/:card_number/reactions` | Add a reaction to a card |
| DELETE | `/:account_slug/cards/:card_number/reactions/:reaction_id` | Remove your reaction |

#### Schema: Reaction

```typescript
interface Reaction {
  id: string;
  content: string; // max 16 characters
  reacter: User;
  url: string;
}
```

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_list_card_reactions` | List reactions on a card |
| `fizzy_add_card_reaction` | Add a reaction (boost) to a card |
| `fizzy_remove_card_reaction` | Remove your reaction from a card |

---

### 3. Comment Reactions - 3 tools

Short responses (max 16 chars) on comments.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:account_slug/cards/:card_number/comments/:comment_id/reactions` | List reactions on a comment |
| POST | `/:account_slug/cards/:card_number/comments/:comment_id/reactions` | Add a reaction to a comment |
| DELETE | `/:account_slug/cards/:card_number/comments/:comment_id/reactions/:reaction_id` | Remove your reaction |

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_list_comment_reactions` | List reactions on a comment |
| `fizzy_add_comment_reaction` | Add a reaction to a comment |
| `fizzy_remove_comment_reaction` | Remove your reaction from a comment |

---

### 4. Steps (To-Do Items on Cards) - 6 tools

Steps are checklist items attached to cards.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:account_slug/cards/:card_number/steps/:step_id` | Get a specific step |
| POST | `/:account_slug/cards/:card_number/steps` | Create a step |
| PUT | `/:account_slug/cards/:card_number/steps/:step_id` | Update a step |
| DELETE | `/:account_slug/cards/:card_number/steps/:step_id` | Delete a step |

**Note:** Steps are returned inline with card details (no separate list endpoint).

#### Schema: Step

```typescript
interface Step {
  id: string;
  content: string;
  completed: boolean;
}
```

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_get_step` | Get a specific step |
| `fizzy_create_step` | Create a new step on a card |
| `fizzy_update_step` | Update a step (content or completed status) |
| `fizzy_delete_step` | Delete a step |
| `fizzy_complete_step` | Mark a step as completed (convenience) |
| `fizzy_uncomplete_step` | Mark a step as not completed (convenience) |

---

### 5. Notifications - 4 tools

User notifications for card events.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:account_slug/notifications` | List notifications (unread first) |
| POST | `/:account_slug/notifications/:notification_id/reading` | Mark as read |
| DELETE | `/:account_slug/notifications/:notification_id/reading` | Mark as unread |
| POST | `/:account_slug/notifications/bulk_reading` | Mark all as read |

#### Schema: Notification

```typescript
interface Notification {
  id: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  title: string;
  body: string;
  creator: User;
  card: {
    id: string;
    title: string;
    status: string;
    url: string;
  };
  url: string;
}
```

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_list_notifications` | List notifications for current user |
| `fizzy_mark_notification_read` | Mark a notification as read |
| `fizzy_mark_notification_unread` | Mark a notification as unread |
| `fizzy_mark_all_notifications_read` | Mark all notifications as read |

---

### 6. Pins Enhancement - 1 tool

Currently have pin/unpin. Need to add list pinned cards.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/my/pins` | List pinned cards (up to 100, not paginated) |

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_list_pins` | List all pinned cards for current user |

---

### 7. Account/Board Entropy (Auto-Postpone Settings) - 2 tools

Update auto-postpone period settings.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/account/entropy` | Update account-level auto-postpone period |
| PUT | `/:account_slug/boards/:board_id/entropy` | Update board-level auto-postpone period |

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_update_account_entropy` | Update account auto-postpone period |
| `fizzy_update_board_entropy` | Update board auto-postpone period |

---

### 8. User Management - 2 tools

Update user profile and deactivate users.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/:account_slug/users/:user_id` | Update user (name, avatar) |
| DELETE | `/:account_slug/users/:user_id` | Deactivate user |

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_update_user` | Update a user's name |
| `fizzy_deactivate_user` | Deactivate a user |

---

### 9. Card Image Management - 1 tool

Remove card header images.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| DELETE | `/:account_slug/cards/:card_number/image` | Remove card header image |

**Note:** Image upload is done via multipart form in PUT card endpoint.

#### MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `fizzy_remove_card_image` | Remove header image from a card |

---

### 10. Enhanced Card Filtering - 0 new tools (enhancement)

Add missing filter parameters to existing `fizzy_list_cards` tool.

#### New Parameters for `fizzy_list_cards`

| Parameter | Type | Description |
|-----------|------|-------------|
| `creator_ids` | string[] | Filter by card creator |
| `closer_ids` | string[] | Filter by who closed the card |
| `card_ids` | string[] | Filter to specific cards |
| `assignment_status` | 'unassigned' | Filter unassigned cards |
| `creation` | DateFilter | Filter by creation date |
| `closure` | DateFilter | Filter by closure date |

```typescript
type DateFilter = 
  | 'today' 
  | 'yesterday' 
  | 'thisweek' 
  | 'lastweek' 
  | 'thismonth' 
  | 'lastmonth' 
  | 'thisyear' 
  | 'lastyear';
```

---

## Implementation Plan

### Phase 1: Core Features (High Priority)

1. **Steps** - Essential for task breakdown, schema already exists
2. **List Pins** - Simple addition, enhances existing pin functionality
3. **Enhanced Card Filtering** - High-value, just parameter additions

### Phase 2: Collaboration Features (Medium Priority)

4. **Card Reactions** - Engagement feature
5. **Comment Reactions** - Engagement feature
6. **Notifications** - Important for staying informed

### Phase 3: Admin Features (Lower Priority)

7. **Webhooks** - Admin-only, complex
8. **User Management** - Admin operations
9. **Entropy Settings** - Niche use case
10. **Card Image Management** - File handling complexity

---

## File Structure for New Code

```
packages/shared/src/schemas/
├── webhooks.ts      # NEW
├── reactions.ts     # NEW
├── notifications.ts # NEW
├── steps.ts         # EXISTS (may need updates)

packages/client/src/endpoints/
├── webhooks.ts      # NEW
├── reactions.ts     # NEW (card + comment reactions)
├── steps.ts         # NEW
├── notifications.ts # NEW

packages/tools/src/
├── webhooks/        # NEW
│   └── tools.ts
├── reactions/       # NEW
│   └── tools.ts
├── steps/           # NEW
│   └── tools.ts
├── notifications/   # NEW
│   └── tools.ts
```

---

## Summary

| Category | New Tools | Priority |
|----------|-----------|----------|
| Steps | 6 | High |
| List Pins | 1 | High |
| Card Filters | 0 (enhancement) | High |
| Card Reactions | 3 | Medium |
| Comment Reactions | 3 | Medium |
| Notifications | 4 | Medium |
| Webhooks | 6 | Low |
| User Management | 2 | Low |
| Entropy Settings | 2 | Low |
| Card Image | 1 | Low |
| **Total** | **28** | |

**Current: 40 tools → Target: 68 tools** for complete Fizzy API coverage.

---

## Notes

### File Uploads

The API supports file uploads for:
- Card header images (`image` field in card create/update)
- User avatars (`avatar` field in user update)
- Rich text attachments (ActionText direct uploads)

File uploads require `multipart/form-data` instead of JSON. This adds complexity and may be deferred.

### Pagination

All list endpoints support pagination via `Link` header with `rel="next"`. Current implementation handles this.

### ETag Caching

The API returns `ETag` headers for caching. Could be implemented later for performance optimization.

---

## CLI Commands

- `fizzy-mcp auth` - Interactive setup wizard (mode selection, token, API key)
- `fizzy-mcp auth --mode remote` - Setup for hosted service
- `fizzy-mcp auth --mode local` - Setup for local server
- `fizzy-mcp configure` - Auto-configure AI agents
- `fizzy-mcp whoami` - Show current identity
- `fizzy-mcp status` - Check configuration status
- `fizzy-mcp logout` - Clear stored credentials
- `fizzy-mcp` (default) - Run local MCP server (only in local mode)

### Auth Flow Features

- **Mode Selection**: Choose between Remote (hosted) or Local mode
- **Browser Integration**: Press Enter when prompted for token to open Fizzy API page
- **API Key Support**: Optional API key for higher rate limits on hosted service

## Configuration

### Config File Location
`~/.config/fizzy-mcp/config.json` (mode 600)

```json
{
  "mode": "remote",
  "accessToken": "your-token",
  "accountSlug": "/897362094",
  "baseUrl": "https://app.fizzy.do",
  "hostedApiKey": "fmcp_..."
}
```

### Environment Variables (take precedence)
- `FIZZY_ACCESS_TOKEN` - Required
- `FIZZY_ACCOUNT_SLUG` - Optional, auto-detected
- `FIZZY_BASE_URL` - Optional, defaults to https://app.fizzy.do
- `FIZZY_MCP_MODE` - `remote` or `local`
- `FIZZY_MCP_API_KEY` - API key for hosted service

### URLs

- Fizzy API Token Page: https://app.fizzy.do/my/profile/api
- Hosted MCP Endpoint: https://fizzy-mcp-hosted.ryanyogan.workers.dev/mcp

## Publishing

Published to npm as `fizzy-do-mcp` (unscoped package).

```bash
npm install -g fizzy-do-mcp
# or
npx fizzy-do-mcp
```

### MCP Configuration

**Remote Mode (HTTP transport):**
```json
{
  "mcpServers": {
    "fizzy": {
      "transport": "http",
      "url": "https://fizzy-mcp-hosted.ryanyogan.workers.dev/mcp",
      "headers": {
        "X-Fizzy-Token": "<your-token>"
      }
    }
  }
}
```

**Local Mode - Claude Desktop / Cursor:**
```json
{
  "mcpServers": {
    "fizzy": {
      "command": "npx",
      "args": ["-y", "fizzy-do-mcp@latest"]
    }
  }
}
```

**OpenCode:**
```json
{
  "mcp": {
    "fizzy": {
      "type": "local",
      "command": ["npx", "-y", "fizzy-do-mcp@latest"]
    }
  }
}
```

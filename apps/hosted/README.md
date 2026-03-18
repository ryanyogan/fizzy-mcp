# Fizzy MCP Hosted Service

A hosted MCP (Model Context Protocol) server for Fizzy that runs on Cloudflare Workers, providing remote MCP access with rate limiting and usage tracking.

## Overview

This service provides a remotely-hosted MCP endpoint at `https://mcp.fizzy.yogan.dev` that allows AI agents to interact with Fizzy without running a local MCP server.

### Features

- **Remote MCP Access** - Use Fizzy MCP tools from any MCP client via HTTP
- **Streamable HTTP Transport** - Uses the MCP SDK's `WebStandardStreamableHTTPServerTransport`
- **Tiered Rate Limits** - Different limits for anonymous, authenticated, and admin users
- **Usage Tracking** - Per-tool invocation tracking and daily usage counters
- **Session Management** - Anonymous sessions with 30-day TTL via KV storage
- **Settings Management** - Configurable limits via admin API

### Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Cache/Sessions**: Cloudflare KV
- **MCP SDK**: `@modelcontextprotocol/sdk` with `WebStandardStreamableHTTPServerTransport`

## API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info and links |
| `/api/health` | GET | Health check |
| `/api/info` | GET | Service info with tier details |
| `/mcp` | POST | MCP endpoint (requires `X-Fizzy-Token`) |
| `/mcp/info` | GET | MCP server capabilities |

### User Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/me/usage` | GET | Current user's usage stats |
| `/api/me/usage/today` | GET | Today's usage |
| `/api/me/history` | GET | Usage history |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/settings` | GET | Get all settings |
| `/api/admin/settings` | PATCH | Update settings |
| `/api/admin/settings/reset` | POST | Reset to defaults |
| `/api/admin/stats/overview` | GET | Global usage stats |
| `/api/admin/stats/tools` | GET | Per-tool statistics |

## Rate Limits

| Tier | Daily Write Limit | Description |
|------|-------------------|-------------|
| Anonymous | 100 | No authentication, session-based |
| Authenticated | 1,000 | API key required (`fmcp_` prefix) |
| Admin | Unlimited | Full access |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit` - Daily limit
- `X-RateLimit-Remaining` - Remaining writes today
- `X-RateLimit-Reset` - UTC date when limit resets
- `X-User-Tier` - Current user tier

## Usage

### Using with MCP Clients

To use the hosted MCP server, configure your MCP client with an HTTP transport pointing to the `/mcp` endpoint.

**Required Headers:**
- `X-Fizzy-Token` - Your Fizzy personal access token

**Optional Headers:**
- `X-Fizzy-Account-Slug` - Your Fizzy account slug (e.g., `/897362094`)
- `X-API-Key` - Platform API key for higher limits (format: `fmcp_...`)

### Example Request

```bash
# Test the MCP endpoint
curl -X POST https://fizzy-mcp-hosted.ryanyogan.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "X-Fizzy-Token: your-fizzy-token" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account with Wrangler configured

### Setup

```bash
# Install dependencies
pnpm install

# Generate types from wrangler config
pnpm wrangler types

# Run locally
pnpm dev
```

### Database

The service uses Cloudflare D1 with Drizzle ORM.

```bash
# Generate migrations from schema changes
pnpm drizzle-kit generate

# Apply migrations locally
pnpm wrangler d1 migrations apply fizzy-mcp-db --local

# Apply migrations to production
pnpm wrangler d1 migrations apply fizzy-mcp-db --remote
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm wrangler deploy
```

## Project Structure

```
apps/hosted/
├── src/
│   ├── index.ts              # Worker entry point
│   ├── app.ts                # Hono app setup with middleware
│   ├── types.ts              # TypeScript types (Env, HonoEnv, etc.)
│   ├── api/
│   │   ├── index.ts          # API router
│   │   ├── health.ts         # Health check endpoints
│   │   ├── me.ts             # User endpoints
│   │   └── admin/
│   │       ├── index.ts      # Admin router
│   │       ├── settings.ts   # Settings CRUD
│   │       └── stats.ts      # Analytics endpoints
│   ├── db/
│   │   ├── index.ts          # Drizzle client factory
│   │   └── schema.ts         # Database schema
│   ├── mcp/
│   │   ├── handler.ts        # MCP route handler
│   │   ├── server.ts         # MCP server factory
│   │   └── write-operations.ts # Write operation classification
│   ├── middleware/
│   │   ├── fizzy-token.ts    # Token extraction
│   │   ├── session.ts        # Session management
│   │   └── logging.ts        # Request logging
│   └── services/
│       ├── settings.ts       # Settings service with caching
│       └── usage.ts          # Usage tracking service
├── drizzle/
│   └── *.sql                 # Database migrations
├── drizzle.config.ts         # Drizzle Kit config
├── wrangler.jsonc            # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Database Schema

### Tables

**settings** - Key-value store for configurable settings
- `key` (TEXT, PK) - Setting name
- `value` (TEXT) - JSON-encoded value
- `description` (TEXT) - Human-readable description
- `updated_at` (INTEGER) - Unix timestamp
- `updated_by` (TEXT) - User ID who last updated

**usage_events** - Individual tool invocation logs
- `id` (TEXT, PK) - UUID
- `user_id` (TEXT) - Authenticated user ID
- `api_key_id` (TEXT) - API key used
- `session_id` (TEXT) - Session identifier
- `fizzy_account_slug` (TEXT) - Fizzy account
- `tool_name` (TEXT) - MCP tool name
- `is_write_operation` (INTEGER) - Boolean
- `success` (INTEGER) - Boolean
- `error_code` (TEXT) - Error code if failed
- `duration_ms` (INTEGER) - Execution time
- `created_at` (INTEGER) - Unix timestamp

**daily_usage** - Aggregated daily counters
- `id` (TEXT, PK) - UUID
- `user_id` (TEXT) - User ID (null for anonymous)
- `session_id` (TEXT) - Session ID
- `date` (TEXT) - ISO date (YYYY-MM-DD)
- `read_count` (INTEGER) - Read operations today
- `write_count` (INTEGER) - Write operations today
- `last_updated` (INTEGER) - Unix timestamp

## Environment Variables

Set these in `wrangler.jsonc` vars or as secrets:

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | `development`, `staging`, or `production` |
| `BETTER_AUTH_SECRET` | Secret for Better Auth (future) |
| `BETTER_AUTH_URL` | Better Auth URL (future) |

## Bindings

| Binding | Type | Description |
|---------|------|-------------|
| `DB` | D1 | SQLite database |
| `KV` | KV | Key-value storage for sessions/cache |

## License

MIT

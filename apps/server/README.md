# Fizzy MCP Server

An MCP (Model Context Protocol) server that enables AI agents to interact with [Fizzy](https://fizzy.do), Basecamp's task management tool.

## Features

- **40 MCP tools** covering all major Fizzy operations
- **Type-safe** TypeScript implementation with Zod validation
- **Retry with exponential backoff** for rate limits and transient errors
- **Auto-detection** of Fizzy account on first run
- **Secure credential storage** in `~/.config/fizzy-mcp/config.json`
- **Environment variable support** for CI/CD and containerized deployments
- **Two deployment modes**: Local (stdio) or Remote (hosted service)

## Quick Start

```bash
# Install globally
npm install -g fizzy-do-mcp

# Run the setup wizard
fizzy-mcp auth
```

The CLI will guide you through:
1. **Choosing a mode** - Remote (recommended) or Local
2. **Getting your Fizzy token** - Press Enter to open the Fizzy API page in your browser
3. **Optional API key** - For higher rate limits on the hosted service

## Deployment Modes

### Remote Mode (Recommended)

Uses our hosted MCP service. No local server needed.
- **Endpoint**: `https://fizzy-mcp-hosted.ryanyogan.workers.dev/mcp`
- **Rate Limits**: 100 writes/day (free), 1,000/day (with API key)

### Local Mode

Runs the MCP server locally via stdio transport.
- Full control over your environment
- No rate limits
- Requires Node.js

## Getting a Fizzy Access Token

When you run `fizzy-mcp auth`, pressing Enter at the token prompt will automatically open your browser to the Fizzy API settings page:

1. The browser opens [app.fizzy.do/my/profile/api](https://app.fizzy.do/my/profile/api)
2. Click **New Personal Access Token**
3. Give it a name and copy the token
4. Paste it back in the CLI

## CLI Commands

```bash
# Interactive setup wizard
fizzy-mcp auth

# Setup with specific mode
fizzy-mcp auth --mode remote
fizzy-mcp auth --mode local

# Setup with all options
fizzy-mcp auth --mode remote --token <token> --api-key <fmcp_key>

# Check current configuration
fizzy-mcp status

# Show your Fizzy identity and accounts
fizzy-mcp whoami

# Auto-configure AI agents
fizzy-mcp configure

# Clear stored credentials
fizzy-mcp logout

# Run the local MCP server (only in local mode)
fizzy-mcp
```

## Configuration for AI Agents

### Remote Mode (HTTP transport)

```json
{
  "mcpServers": {
    "fizzy": {
      "transport": "http",
      "url": "https://fizzy-mcp-hosted.ryanyogan.workers.dev/mcp",
      "headers": {
        "X-Fizzy-Token": "<your-fizzy-token>",
        "X-API-Key": "<optional-api-key>"
      }
    }
  }
}
```

### Local Mode (stdio transport)

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

**OpenCode** (`~/.config/opencode/opencode.json`):

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

**Cursor** (`~/.cursor/mcp.json`):

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

## Available Tools

### Identity & Account (2 tools)
| Tool | Description |
|------|-------------|
| `fizzy_get_identity` | Get current user and list accessible accounts |
| `fizzy_get_account` | Get account settings (name, card count, auto-postpone) |

### Boards (7 tools)
| Tool | Description |
|------|-------------|
| `fizzy_list_boards` | List all boards in the account |
| `fizzy_get_board` | Get a specific board by ID |
| `fizzy_create_board` | Create a new board |
| `fizzy_update_board` | Update board name or settings |
| `fizzy_delete_board` | Delete a board |
| `fizzy_publish_board` | Publish board (make public) |
| `fizzy_unpublish_board` | Unpublish board |

### Cards (18 tools)
| Tool | Description |
|------|-------------|
| `fizzy_list_cards` | List cards with optional filters |
| `fizzy_get_card` | Get a card by number |
| `fizzy_create_card` | Create a new card |
| `fizzy_update_card` | Update card title, description, or tags |
| `fizzy_delete_card` | Delete a card |
| `fizzy_close_card` | Close (complete) a card |
| `fizzy_reopen_card` | Reopen a closed card |
| `fizzy_postpone_card` | Move card to "Not Now" |
| `fizzy_triage_card` | Move card to a column |
| `fizzy_untriage_card` | Remove card from column (back to triage) |
| `fizzy_tag_card` | Toggle a tag on a card |
| `fizzy_assign_card` | Toggle user assignment on a card |
| `fizzy_watch_card` | Subscribe to card notifications |
| `fizzy_unwatch_card` | Unsubscribe from card notifications |
| `fizzy_pin_card` | Pin a card for quick access |
| `fizzy_unpin_card` | Unpin a card |
| `fizzy_mark_golden` | Mark a card as golden (important) |
| `fizzy_unmark_golden` | Remove golden status |

### Comments (5 tools)
| Tool | Description |
|------|-------------|
| `fizzy_list_comments` | List comments on a card |
| `fizzy_get_comment` | Get a specific comment |
| `fizzy_create_comment` | Add a comment to a card |
| `fizzy_update_comment` | Update a comment |
| `fizzy_delete_comment` | Delete a comment |

### Columns (5 tools)
| Tool | Description |
|------|-------------|
| `fizzy_list_columns` | List columns on a board |
| `fizzy_get_column` | Get a specific column |
| `fizzy_create_column` | Create a new column |
| `fizzy_update_column` | Update column name or color |
| `fizzy_delete_column` | Delete a column |

### Tags (1 tool)
| Tool | Description |
|------|-------------|
| `fizzy_list_tags` | List all tags in the account |

### Users (2 tools)
| Tool | Description |
|------|-------------|
| `fizzy_list_users` | List all active users |
| `fizzy_get_user` | Get a specific user's details |

## Configuration

### Config File

Stored at `~/.config/fizzy-mcp/config.json` with mode 600:

```json
{
  "mode": "remote",
  "accessToken": "your-fizzy-token",
  "accountSlug": "/897362094",
  "hostedApiKey": "fmcp_..."
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `FIZZY_ACCESS_TOKEN` | Personal access token (required) |
| `FIZZY_ACCOUNT_SLUG` | Account slug (optional, auto-detected) |
| `FIZZY_BASE_URL` | API base URL (default: `https://app.fizzy.do`) |
| `FIZZY_MCP_MODE` | Server mode: `remote` or `local` |
| `FIZZY_MCP_API_KEY` | Hosted service API key |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run locally
node dist/cli.js auth
node dist/cli.js status
node dist/index.js
```

## Architecture

This package is part of the fizzy-mcp monorepo:

- **@fizzy-mcp/shared** - Core types, Zod schemas, Result type
- **@fizzy-mcp/client** - Fizzy API client with retry logic
- **@fizzy-mcp/tools** - MCP tool definitions
- **fizzy-do-mcp** - This package: CLI and local MCP server

## License

MIT

## Credits

Built for use with [Claude](https://claude.ai) and the [Model Context Protocol](https://modelcontextprotocol.io).

# Fizzy MCP

<p align="center">
  <img src="docs/public/logo.svg" width="120" alt="Fizzy MCP Logo">
</p>

<p align="center">
  <strong>AI-Native Task Management with Model Context Protocol</strong>
</p>

<p align="center">
  Connect your AI assistant to <a href="https://fizzy.do">Fizzy</a> for intelligent, context-aware project management.
</p>

<p align="center">
  <a href="https://fizzy.yogan.dev">Documentation</a> •
  <a href="https://fizzy.yogan.dev/getting-started/installation">Quick Start</a> •
  <a href="https://github.com/ryanyogan/fizzy-mcp/issues">Issues</a>
</p>

---

## What is Fizzy MCP?

Fizzy MCP is an open-source [Model Context Protocol](https://modelcontextprotocol.io) server that enables AI assistants to interact with [Fizzy](https://fizzy.do), Basecamp's task management tool.

With Fizzy MCP, your AI can:

- **Read your boards and cards** - Get full context about your projects
- **Create new cards** - Add tasks directly from conversation
- **Update existing cards** - Modify descriptions, tags, and status
- **Move cards** - Triage cards to columns, postpone, or close them
- **Add comments** - Leave notes and updates on cards

## Quick Start

```bash
npx fizzy-do-mcp@latest configure
```

The wizard will:
1. Detect your installed editors (Claude Desktop, Cursor, etc.)
2. Prompt for your Fizzy API token
3. Configure each editor automatically

**Or configure manually:**

```json
{
  "mcpServers": {
    "fizzy": {
      "command": "npx",
      "args": ["-y", "fizzy-do-mcp@latest"],
      "env": {
        "FIZZY_TOKEN": "your-fizzy-api-token"
      }
    }
  }
}
```

## Supported Editors

| Editor | Status | Configuration |
|--------|--------|---------------|
| Claude Desktop | ✅ Full support | [Guide](https://fizzy.yogan.dev/configuration/claude-desktop) |
| Claude Code | ✅ Full support | [Guide](https://fizzy.yogan.dev/configuration/claude-code) |
| Cursor | ✅ Full support | [Guide](https://fizzy.yogan.dev/configuration/cursor) |
| OpenCode | ✅ Full support | [Guide](https://fizzy.yogan.dev/configuration/opencode) |
| Windsurf | ✅ Full support | [Guide](https://fizzy.yogan.dev/configuration/windsurf) |
| Continue | ✅ Full support | [Guide](https://fizzy.yogan.dev/configuration/continue) |

## Example Usage

```
You: What's on my Engineering board?

AI: I found 12 open cards on your Engineering board:

In Progress:
- #234 "Implement user authentication" (assigned to you)
- #235 "API rate limiting"

Needs Triage:
- #240 "Database migration script"
- #241 "Update dependencies"

You: Create a card for adding dark mode support

AI: Created card #242 "Add dark mode support" on the Engineering board.
    Would you like me to add any tags or assign it to someone?
```

## Available Tools

Fizzy MCP provides 40+ tools covering all major Fizzy operations:

| Category | Tools |
|----------|-------|
| **Identity** | `fizzy_get_identity`, `fizzy_get_account` |
| **Boards** | `fizzy_list_boards`, `fizzy_get_board`, `fizzy_create_board`, `fizzy_update_board`, `fizzy_delete_board`, `fizzy_publish_board`, `fizzy_unpublish_board` |
| **Cards** | `fizzy_list_cards`, `fizzy_get_card`, `fizzy_create_card`, `fizzy_update_card`, `fizzy_delete_card`, `fizzy_close_card`, `fizzy_reopen_card`, `fizzy_postpone_card`, `fizzy_triage_card`, `fizzy_untriage_card`, `fizzy_tag_card`, `fizzy_assign_card`, `fizzy_watch_card`, `fizzy_unwatch_card`, `fizzy_pin_card`, `fizzy_unpin_card`, `fizzy_mark_golden`, `fizzy_unmark_golden` |
| **Comments** | `fizzy_list_comments`, `fizzy_get_comment`, `fizzy_create_comment`, `fizzy_update_comment`, `fizzy_delete_comment` |
| **Columns** | `fizzy_list_columns`, `fizzy_get_column`, `fizzy_create_column`, `fizzy_update_column`, `fizzy_delete_column` |
| **Tags & Users** | `fizzy_list_tags`, `fizzy_list_users`, `fizzy_get_user` |

See the [Tools Reference](https://fizzy.yogan.dev/tools/overview) for complete documentation.

## Architecture

```
fizzy-mcp/
├── packages/
│   ├── shared/      # Types, schemas, Result type
│   ├── client/      # Type-safe HTTP client for Fizzy API
│   └── tools/       # MCP tool definitions
├── apps/
│   ├── server/      # CLI and MCP server (npm: fizzy-do-mcp)
│   └── hosted/      # Hosted proxy service (Cloudflare Workers)
└── docs/            # Documentation site (VitePress)
```

### Deployment Options

**Local Server (Recommended)**
- Run via `npx fizzy-do-mcp@latest`
- Maximum privacy - tokens stay on your machine
- No rate limits

**Hosted Proxy**
- Available at `https://mcp.fizzy.yogan.dev`
- Use `X-Fizzy-Token` header for authentication
- Useful for environments where npx isn't available

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checker
pnpm typecheck

# Run linter
pnpm lint

# Develop the CLI
cd apps/server
pnpm dev

# Develop docs
cd docs
pnpm dev
```

## Requirements

- **Node.js 20+** - For running the local MCP server
- **Fizzy Account** - Sign up at [fizzy.do](https://fizzy.do)
- **API Token** - Generate from your Fizzy account settings
- **MCP-Compatible Editor** - Claude Desktop, Cursor, etc.

## License

MIT

## Credits

- Built for [Claude](https://claude.ai) and the [Model Context Protocol](https://modelcontextprotocol.io)
- Connects to [Fizzy](https://fizzy.do), Basecamp's task management tool
- Developed by [Ryan Yogan](https://github.com/ryanyogan)

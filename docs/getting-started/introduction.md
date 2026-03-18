# Introduction

Fizzy MCP is an open-source [Model Context Protocol](https://modelcontextprotocol.io) server that connects AI assistants to [Fizzy](https://fizzy.do), enabling intelligent, context-aware task management.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that allows AI assistants to interact with external tools and data sources. Instead of copy-pasting information between your AI and task manager, MCP lets them communicate directly.

## What Can Fizzy MCP Do?

With Fizzy MCP, your AI assistant can:

- **Read your boards and cards** - Get full context about your projects
- **Create new cards** - Add tasks directly from conversation
- **Update existing cards** - Modify descriptions, tags, and status
- **Move cards** - Triage cards to columns, postpone, or close them
- **Add comments** - Leave notes and updates on cards
- **Search and filter** - Find specific cards by status, tags, or content

## How It Works

```
┌──────────────────┐     ┌──────────────┐     ┌─────────────┐
│   AI Assistant   │────▶│  Fizzy MCP   │────▶│  Fizzy API  │
│ (Claude, etc.)   │◀────│   Server     │◀────│             │
└──────────────────┘     └──────────────┘     └─────────────┘
```

1. **Your AI** sends requests through the MCP protocol
2. **Fizzy MCP** translates them to Fizzy API calls
3. **Fizzy** processes the request and returns results
4. **Your AI** presents the information in conversation

## Deployment Options

### Local Server (Recommended)

Run the MCP server locally on your machine:

```bash
npx fizzy-do-mcp@latest
```

This is the recommended approach for:
- Maximum privacy (tokens stay local)
- Best performance (no network hops)
- Full offline capability (once configured)

### Hosted Proxy

Use our hosted proxy at `https://fizzy.yogan.dev/mcp`:

```json
{
  "mcpServers": {
    "fizzy": {
      "url": "https://fizzy.yogan.dev/mcp",
      "headers": {
        "X-Fizzy-Token": "your-token"
      }
    }
  }
}
```

Useful for:
- Quick testing
- Environments where npx isn't available
- Remote/cloud-based AI setups

## Requirements

- **Node.js 18+** - For running the local MCP server
- **Fizzy Account** - Sign up at [fizzy.do](https://fizzy.do)
- **API Token** - Generate from your Fizzy account settings
- **MCP-Compatible Editor** - Claude Desktop, Cursor, OpenCode, etc.

## Next Steps

1. [Install Fizzy MCP](/getting-started/installation) - Set up the server
2. [Quick Start](/getting-started/quickstart) - Your first AI-driven task
3. [Configure Your Editor](/configuration/claude-desktop) - Editor-specific setup

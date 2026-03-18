# OpenCode

[OpenCode](https://opencode.ai) is an open-source AI coding assistant with MCP support. It uses TOML configuration files.

## Config File Location

| OS | Path |
|----|------|
| macOS | `~/.config/opencode/config.toml` |
| Windows | `%APPDATA%\opencode\config.toml` |
| Linux | `~/.config/opencode/config.toml` |

## Local Server (Recommended)

Add Fizzy to your `config.toml`:

```toml
[mcp.fizzy]
type = "local"
command = ["npx", "-y", "fizzy-do-mcp@latest"]

[mcp.fizzy.environment]
FIZZY_TOKEN = "your-fizzy-api-token"
```

::: warning Important
OpenCode uses `type = "local"` (not `"stdio"`) and `environment` (not `env`). This differs from other editors.
:::

## Remote/Hosted Proxy

For the hosted proxy, use `type = "remote"`:

```toml
[mcp.fizzy]
type = "remote"
url = "https://fizzy.yogan.dev/mcp"

[mcp.fizzy.headers]
X-Fizzy-Token = "your-fizzy-api-token"
```

::: warning Important
OpenCode uses `type = "remote"` (not `"http"`). The type name matters!
:::

## Multiple Servers

```toml
[mcp.fizzy]
type = "local"
command = ["npx", "-y", "fizzy-do-mcp@latest"]

[mcp.fizzy.environment]
FIZZY_TOKEN = "your-fizzy-token"

[mcp.github]
type = "local"
command = ["npx", "-y", "@modelcontextprotocol/server-github"]

[mcp.github.environment]
GITHUB_TOKEN = "your-github-token"
```

## Configuration Reference

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"local"` \| `"remote"` | Server type |
| `command` | `string[]` | Command array for local servers |
| `url` | `string` | URL for remote servers |
| `environment` | `table` | Environment variables (local) |
| `headers` | `table` | HTTP headers (remote) |

## Verify It Works

Restart OpenCode and try:

```
What Fizzy boards do I have?
```

## Troubleshooting

### "Unknown type: http"

Use `type = "remote"` instead of `type = "http"`.

### "Unknown type: stdio"

Use `type = "local"` instead of `type = "stdio"`.

### "env is not a valid field"

Use `environment` instead of `env`:

```toml
# Wrong
[mcp.fizzy.env]
FIZZY_TOKEN = "..."

# Correct
[mcp.fizzy.environment]
FIZZY_TOKEN = "..."
```

### Config not loading

1. Verify TOML syntax at [toml-lint.com](https://www.toml-lint.com/)
2. Check file location matches your OS
3. Restart OpenCode completely

### Command not found

Ensure the command array includes the full path or that the command is in your PATH:

```toml
# Using full path
command = ["/usr/local/bin/npx", "-y", "fizzy-do-mcp@latest"]

# Or ensure npx is in PATH
command = ["npx", "-y", "fizzy-do-mcp@latest"]
```

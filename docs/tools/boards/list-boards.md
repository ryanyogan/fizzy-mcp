# fizzy_list_boards

List all Fizzy boards you have access to in the current account.

## Description

Retrieves all boards the authenticated user can access. Boards are containers for cards and columns that organize work within a Fizzy account.

## Parameters

This tool takes no parameters.

## Returns

```typescript
Board[]
```

### Board Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique board identifier |
| `name` | `string` | Board name |
| `all_access` | `boolean` | Whether all account users can access |
| `auto_postpone_period_in_days` | `number \| null` | Days before auto-postpone |
| `created_at` | `string` | ISO 8601 timestamp |
| `url` | `string` | Direct URL to the board |
| `public_url` | `string \| undefined` | Public URL if published |
| `creator` | `User` | User who created the board |

## Example Usage

```
AI: Let me list your boards.

[Calls fizzy_list_boards]

Found 3 board(s):
1. "Engineering" - 45 active cards
2. "Marketing" - 12 active cards  
3. "Personal" - 8 active cards
```

## When to Use

- To see all available boards
- Before creating or finding cards
- When the user asks "what boards do I have?"

## Related Tools

- [fizzy_get_board](/tools/boards/get-board) - Get details of a specific board
- [fizzy_create_board](/tools/boards/create-board) - Create a new board
- [fizzy_list_cards](/tools/cards/list-cards) - List cards on a board

# fizzy_get_board

Get details of a specific Fizzy board by its ID.

## Description

Retrieves detailed information about a single board including its settings, creator, and access permissions.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The unique identifier of the board |

## Returns

```typescript
{
  id: string;
  name: string;
  all_access: boolean;
  auto_postpone_period_in_days: number | null;
  created_at: string;
  url: string;
  public_url?: string;
  creator: User;
}
```

## Example Usage

```
AI: Let me get the details of your Engineering board.

[Calls fizzy_get_board with board_id: "board_abc123"]

Board: "Engineering"
- Access: All users
- Auto-postpone: 14 days
- Created by: John Doe
- URL: https://app.fizzy.do/123456/boards/board_abc123
```

## When to Use

- To check board settings before updating
- To verify board access permissions
- To get the board's public URL if published

## Related Tools

- [fizzy_list_boards](/tools/boards/list-boards) - List all boards
- [fizzy_update_board](/tools/boards/update-board) - Update board settings
- [fizzy_list_columns](/tools/columns/list-columns) - List columns on the board

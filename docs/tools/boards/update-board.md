# fizzy_update_board

Update an existing Fizzy board.

## Description

Modifies the settings of an existing board. Only board administrators can update boards.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The unique identifier of the board |
| `name` | `string` | No | New name for the board |
| `all_access` | `boolean` | No | Whether all account users can access |
| `auto_postpone_period_in_days` | `number` | No | Days of inactivity before auto-postpone |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll update the board settings to change the auto-postpone period.

[Calls fizzy_update_board with:
  board_id: "board_abc123"
  auto_postpone_period_in_days: 7
]

Board updated successfully
```

## When to Use

- To rename a board
- To change access permissions
- To adjust auto-postpone settings

## Permissions

- Only board administrators can update boards
- The board creator is automatically an admin

## Related Tools

- [fizzy_get_board](/tools/boards/get-board) - Get current settings
- [fizzy_delete_board](/tools/boards/delete-board) - Delete the board

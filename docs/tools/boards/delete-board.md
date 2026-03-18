# fizzy_delete_board

Delete a Fizzy board.

## Description

Permanently deletes a board and all its contents including cards, columns, and comments. This action is irreversible.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The unique identifier of the board to delete |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: Are you sure you want to delete the "Old Project" board? 
This will permanently delete all cards and cannot be undone.

User: Yes, delete it.

[Calls fizzy_delete_board with board_id: "board_abc123"]

Board deleted
```

## When to Use

- To remove boards that are no longer needed
- When cleaning up completed projects

## Permissions

- Only board administrators can delete boards
- The board creator is automatically an admin

## Warning

This action is **irreversible**. All cards, columns, comments, and attachments on the board will be permanently deleted.

## Related Tools

- [fizzy_list_boards](/tools/boards/list-boards) - List all boards
- [fizzy_get_board](/tools/boards/get-board) - Check board contents before deleting

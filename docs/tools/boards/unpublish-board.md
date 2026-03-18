# fizzy_unpublish_board

Unpublish a Fizzy board, removing public access.

## Description

Removes public access from a previously published board. The public URL will no longer work.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The unique identifier of the board to unpublish |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll unpublish the board to remove external access.

[Calls fizzy_unpublish_board with board_id: "board_abc123"]

Board unpublished
```

## When to Use

- To revoke public access to a board
- When a project becomes private
- To stop sharing a roadmap externally

## Notes

- Existing public URL links will stop working immediately
- Account members retain full access
- The board can be re-published later

## Related Tools

- [fizzy_publish_board](/tools/boards/publish-board) - Make board public again
- [fizzy_get_board](/tools/boards/get-board) - Check publication status

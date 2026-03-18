# fizzy_publish_board

Publish a Fizzy board, making it publicly accessible.

## Description

Makes a board publicly accessible via a shareable link. Anyone with the link can view the board without logging in.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The unique identifier of the board to publish |

## Returns

```typescript
{
  id: string;
  name: string;
  public_url: string;  // The shareable public URL
  // ... other board fields
}
```

## Example Usage

```
AI: I'll publish your roadmap board so you can share it externally.

[Calls fizzy_publish_board with board_id: "board_abc123"]

Board published. Public URL: https://fizzy.do/boards/abc123
```

## When to Use

- To share a board with people outside your organization
- For public roadmaps or status pages
- When you need a read-only shareable view

## Notes

- Public boards are read-only for external viewers
- Account members still have full access
- The public URL remains stable after publishing

## Related Tools

- [fizzy_unpublish_board](/tools/boards/unpublish-board) - Remove public access
- [fizzy_get_board](/tools/boards/get-board) - Check if a board is published

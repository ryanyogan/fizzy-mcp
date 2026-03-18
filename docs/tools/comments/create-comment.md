# fizzy_create_comment

Add a comment to a Fizzy card.

## Description

Creates a new comment on a card. Comments support rich text formatting with markdown.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `body` | `string` | Yes | The comment body (supports markdown/HTML) |

### Body Format

Comments support:
- **Bold** and *italic* text
- [Links](https://example.com)
- Bullet and numbered lists
- `inline code` and code blocks

## Returns

Created comment object.

## Example Usage

```
AI: I'll add a progress update to the card.

[Calls fizzy_create_comment with:
  card_number: 42
  body: "## Progress Update\n\n- Completed API integration\n- Started on UI components\n- ETA: End of week"
]

Created comment on card #42
```

## Related Tools

- [fizzy_list_comments](/tools/comments/list-comments) - List comments
- [fizzy_update_comment](/tools/comments/update-comment) - Edit a comment

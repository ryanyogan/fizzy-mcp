# fizzy_update_comment

Update a comment on a Fizzy card.

## Description

Edits an existing comment. Only the comment creator can update their comments.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `comment_id` | `string` | Yes | The comment ID |
| `body` | `string` | Yes | The new comment body (supports markdown/HTML) |

## Returns

Updated comment object.

## Example Usage

```
AI: I'll fix the typo in that comment.

[Calls fizzy_update_comment with:
  card_number: 42
  comment_id: "comment_abc123"
  body: "Updated progress: Feature is now complete!"
]

Comment updated
```

## Permissions

Only the comment creator can update their own comments.

## Related Tools

- [fizzy_list_comments](/tools/comments/list-comments) - Get comment IDs
- [fizzy_delete_comment](/tools/comments/delete-comment) - Delete a comment

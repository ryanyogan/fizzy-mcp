# fizzy_delete_comment

Delete a comment from a Fizzy card.

## Description

Permanently deletes a comment. Only the comment creator can delete their comments.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `comment_id` | `string` | Yes | The comment ID |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll delete that outdated comment.

[Calls fizzy_delete_comment with:
  card_number: 42
  comment_id: "comment_abc123"
]

Comment deleted
```

## Permissions

Only the comment creator can delete their own comments.

## Related Tools

- [fizzy_list_comments](/tools/comments/list-comments) - Get comment IDs
- [fizzy_update_comment](/tools/comments/update-comment) - Edit instead of delete

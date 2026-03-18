# fizzy_get_comment

Get a specific comment by ID.

## Description

Retrieves the full details of a single comment.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `comment_id` | `string` | Yes | The comment ID |

## Returns

```typescript
{
  id: string;
  body: { plain_text: string; html: string };
  creator: User;
  created_at: string;
  updated_at: string;
  url: string;
}
```

## Example Usage

```
AI: Let me get the details of that comment.

[Calls fizzy_get_comment with:
  card_number: 42
  comment_id: "comment_abc123"
]

Comment by John (2024-01-15):
"This looks good! Ready for review."
```

## Related Tools

- [fizzy_list_comments](/tools/comments/list-comments) - List all comments

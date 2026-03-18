# fizzy_list_comments

List all comments on a Fizzy card.

## Description

Retrieves all comments attached to a card, sorted chronologically (oldest first).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |

## Returns

```typescript
Comment[]
```

### Comment Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique comment identifier |
| `body` | `object` | Comment content with `plain_text` and `html` |
| `creator` | `User` | User who wrote the comment |
| `created_at` | `string` | ISO 8601 timestamp |
| `updated_at` | `string` | Last update timestamp |
| `url` | `string` | Direct URL to the comment |

## Example Usage

```
AI: Let me get the comments on card #42.

[Calls fizzy_list_comments with card_number: 42]

Found 3 comment(s) on card #42:
1. John (2024-01-15): "Started working on this"
2. Jane (2024-01-16): "Looks good, just need tests"
3. John (2024-01-17): "Tests added, ready for review"
```

## Related Tools

- [fizzy_create_comment](/tools/comments/create-comment) - Add a comment
- [fizzy_get_card](/tools/cards/get-card) - Get card details

# fizzy_list_tags

List all tags in the Fizzy account.

## Description

Retrieves all tags in the account, sorted alphabetically. Use tag IDs from this list to filter cards or apply tags.

## Parameters

This tool takes no parameters.

## Returns

```typescript
Tag[]
```

### Tag Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique tag identifier |
| `title` | `string` | Tag name (without #) |
| `created_at` | `string` | ISO 8601 timestamp |
| `url` | `string` | Direct URL |

## Example Usage

```
AI: Let me see what tags are available.

[Calls fizzy_list_tags]

Found 5 tag(s):
1. "bug" (tag_123)
2. "feature" (tag_456)
3. "documentation" (tag_789)
4. "urgent" (tag_abc)
5. "blocked" (tag_def)
```

## When to Use

- To get tag IDs for filtering cards
- Before adding tags to cards
- To see all available labels

## Related Tools

- [fizzy_tag_card](/tools/cards/tag-card) - Add/remove tag from card
- [fizzy_list_cards](/tools/cards/list-cards) - Filter cards by tag

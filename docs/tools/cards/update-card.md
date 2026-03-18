# fizzy_update_card

Update an existing Fizzy card.

## Description

Modifies the title, description, status, or tags of an existing card.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `title` | `string` | No | New title for the card |
| `description` | `string` | No | New description (supports markdown/HTML) |
| `status` | `string` | No | `"drafted"` or `"published"` |
| `tag_ids` | `string[]` | No | Tag IDs to set on the card |

## Returns

Updated card object.

## Example Usage

```
AI: I'll update the card title and add more details to the description.

[Calls fizzy_update_card with:
  card_number: 42
  title: "Fix login timeout - URGENT"
  description: "## Problem\nUsers experiencing 30s timeouts.\n\n## Solution\nIncrease timeout to 60s and add retry logic."
]

Updated card #42
```

## Related Tools

- [fizzy_get_card](/tools/cards/get-card) - Get current card state
- [fizzy_tag_card](/tools/cards/tag-card) - Toggle individual tags

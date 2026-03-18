# fizzy_create_card

Create a new Fizzy card on a board.

## Description

Creates a new card on the specified board. Cards are the primary work items in Fizzy and support rich text descriptions with markdown.

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `board_id` | `string` | Yes | - | The board ID to create the card on |
| `title` | `string` | Yes | - | The card title |
| `description` | `string` | No | - | Card description (supports markdown/HTML) |
| `status` | `string` | No | `"published"` | `"drafted"` or `"published"` |
| `tag_ids` | `string[]` | No | - | Tag IDs to apply to the card |

### Description Format

Descriptions support:
- **Bold** and *italic* text
- [Links](https://example.com)
- Bullet and numbered lists
- `inline code` and code blocks
- Basic HTML

## Returns

```typescript
{
  id: string;
  number: number;
  title: string;
  // ... full card object
}
```

## Example Usage

```
AI: I'll create a card for the new feature request.

[Calls fizzy_create_card with:
  board_id: "board_abc123"
  title: "Add dark mode support"
  description: "## Overview\nImplement dark mode theme.\n\n## Tasks\n- Design dark color palette\n- Update CSS variables\n- Add theme toggle"
  tag_ids: ["tag_feature"]
]

Created card #123: "Add dark mode support"
URL: https://app.fizzy.do/123456/cards/123
```

## When to Use

- To capture new tasks or ideas
- When the user describes work that needs to be done
- To break down large tasks into smaller cards

## Notes

- New cards appear in triage (not in any column)
- Use `fizzy_triage_card` to move to a column
- Drafted cards are only visible to the creator

## Related Tools

- [fizzy_list_boards](/tools/boards/list-boards) - Get board IDs
- [fizzy_list_tags](/tools/tags/list-tags) - Get tag IDs
- [fizzy_triage_card](/tools/cards/triage-card) - Move to a column
- [fizzy_assign_card](/tools/cards/assign-card) - Assign to users

# fizzy_get_card

Get details of a specific Fizzy card by its number.

## Description

Retrieves complete information about a single card including its description, column placement, and all metadata.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number (visible in Fizzy URLs) |

## Returns

```typescript
{
  id: string;
  number: number;
  title: string;
  status: "drafted" | "published";
  description: string;
  description_html: string;
  golden: boolean;
  closed: boolean;
  tags: string[];
  assignees: User[];
  board: BoardSummary;
  column?: Column;
  creator: User;
  created_at: string;
  last_active_at: string;
  url: string;
  comments_url: string;
}
```

## Example Usage

```
AI: Let me get the details of card #42.

[Calls fizzy_get_card with card_number: 42]

Card #42: "Implement OAuth2 authentication"
Board: Engineering
Column: In Progress
Tags: #feature, #backend
Assigned to: @john, @jane

Description:
Add support for OAuth2 authentication with Google and GitHub providers.

## Requirements
- Google OAuth2 integration
- GitHub OAuth2 integration
- Token refresh handling
```

## When to Use

- To read the full description of a card
- To check which column a card is in
- To see who is assigned to a card
- Before updating or modifying a card

## Related Tools

- [fizzy_list_cards](/tools/cards/list-cards) - Find cards
- [fizzy_update_card](/tools/cards/update-card) - Modify the card
- [fizzy_list_comments](/tools/comments/list-comments) - Get card comments

# fizzy_delete_card

Delete a Fizzy card.

## Description

Permanently deletes a card and all its comments. Only the card creator or board administrators can delete cards.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to delete |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: Are you sure you want to delete card #42? This cannot be undone.

User: Yes, delete it.

[Calls fizzy_delete_card with card_number: 42]

Card #42 deleted
```

## Warning

This action is **irreversible**. The card and all its comments will be permanently deleted.

## Related Tools

- [fizzy_close_card](/tools/cards/close-card) - Mark as complete instead of deleting
- [fizzy_postpone_card](/tools/cards/postpone-card) - Defer for later instead

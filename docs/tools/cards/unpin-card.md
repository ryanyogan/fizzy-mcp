# fizzy_unpin_card

Unpin a Fizzy card.

## Description

Removes a card from the pinned list.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to unpin |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll unpin card #42.

[Calls fizzy_unpin_card with card_number: 42]

Card #42 unpinned
```

## Related Tools

- [fizzy_pin_card](/tools/cards/pin-card) - Pin a card

# fizzy_watch_card

Subscribe to notifications for a Fizzy card.

## Description

Starts watching a card to receive notifications when comments are added or the card is updated.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to watch |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll subscribe you to updates on card #42.

[Calls fizzy_watch_card with card_number: 42]

Now watching card #42
```

## Related Tools

- [fizzy_unwatch_card](/tools/cards/unwatch-card) - Stop watching

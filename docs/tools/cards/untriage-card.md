# fizzy_untriage_card

Send a Fizzy card back to triage.

## Description

Removes a card from its current column, sending it back to the triage area for re-evaluation.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to untriage |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll send card #42 back to triage for re-prioritization.

[Calls fizzy_untriage_card with card_number: 42]

Card #42 sent back to triage
```

## When to Use

- When a card needs to be re-evaluated
- To remove a card from a workflow column
- During sprint re-planning

## Related Tools

- [fizzy_triage_card](/tools/cards/triage-card) - Move to a column
- [fizzy_postpone_card](/tools/cards/postpone-card) - Defer for later

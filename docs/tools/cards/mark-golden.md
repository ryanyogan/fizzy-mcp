# fizzy_mark_golden

Mark a Fizzy card as golden (important).

## Description

Marks a card as "golden" to indicate it's important or high-priority. Golden cards are highlighted and can be filtered in card lists.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to mark as golden |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll mark card #42 as important.

[Calls fizzy_mark_golden with card_number: 42]

Card #42 marked as golden
```

## When to Use

- For high-priority tasks
- To highlight important work items
- When a card needs special attention

## Related Tools

- [fizzy_unmark_golden](/tools/cards/unmark-golden) - Remove golden status
- [fizzy_list_cards](/tools/cards/list-cards) - Filter with `indexed_by: "golden"`

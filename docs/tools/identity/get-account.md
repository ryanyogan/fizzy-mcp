# fizzy_get_account

Get the current Fizzy account settings.

## Description

Retrieves settings and configuration for the currently active Fizzy account, including the account name, card count, and auto-postpone settings.

## Parameters

This tool takes no parameters.

## Returns

```typescript
{
  id: string;
  name: string;
  slug: string;
  card_count: number;
  auto_postpone_period_in_days: number | null;
  created_at: string;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique account identifier |
| `name` | `string` | Account display name |
| `slug` | `string` | Account slug for URLs |
| `card_count` | `number` | Total cards in the account |
| `auto_postpone_period_in_days` | `number \| null` | Default auto-postpone setting |
| `created_at` | `string` | ISO 8601 timestamp |

## Example Usage

```
AI: Let me check your account settings.

[Calls fizzy_get_account]

Account: "Engineering Team"
- Total cards: 342
- Auto-postpone: 14 days of inactivity
```

## When to Use

- To check account configuration
- To see total card count
- To verify auto-postpone settings

## Related Tools

- [fizzy_get_identity](/tools/identity/get-identity) - Get available accounts
- [fizzy_list_boards](/tools/boards/list-boards) - List boards in the account

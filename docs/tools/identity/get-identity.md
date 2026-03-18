# fizzy_get_identity

Get the current user identity and list of accessible Fizzy accounts.

## Description

This tool retrieves the authenticated user's identity and all Fizzy accounts they have access to. Use this as the first step to discover which accounts are available before performing other operations.

## Parameters

This tool takes no parameters.

## Returns

```typescript
{
  accounts: Account[];
}
```

### Account Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique account identifier |
| `name` | `string` | Account display name |
| `slug` | `string` | Account slug (e.g., "/123456") |
| `created_at` | `string` | ISO 8601 timestamp |
| `user` | `User` | Current user's info within this account |

## Example Usage

```
AI: Let me check which Fizzy accounts you have access to.

[Calls fizzy_get_identity]

Found 2 account(s):
- "Personal" (slug: /123456)
- "Work Team" (slug: /789012)
```

## When to Use

- At the start of a session to discover available accounts
- When the user asks "which accounts do I have?"
- Before performing operations that require an account context

## Related Tools

- [fizzy_get_account](/tools/identity/get-account) - Get account settings
- [fizzy_list_boards](/tools/boards/list-boards) - List boards in the account

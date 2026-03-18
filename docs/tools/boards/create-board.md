# fizzy_create_board

Create a new Fizzy board.

## Description

Creates a new board in the current account. Boards are the top-level containers for organizing cards and workflows.

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | The name of the board |
| `all_access` | `boolean` | No | `true` | Whether all account users can access this board |
| `auto_postpone_period_in_days` | `number` | No | - | Days of inactivity before cards are auto-postponed |

## Returns

```typescript
{
  id: string;
  name: string;
  all_access: boolean;
  auto_postpone_period_in_days: number | null;
  created_at: string;
  url: string;
  creator: User;
}
```

## Example Usage

```
AI: I'll create a new board for your Q1 planning.

[Calls fizzy_create_board with:
  name: "Q1 2024 Planning"
  all_access: true
  auto_postpone_period_in_days: 14
]

Created board "Q1 2024 Planning" (board_xyz789)
URL: https://app.fizzy.do/123456/boards/board_xyz789
```

## When to Use

- When the user wants to start a new project
- To organize work into separate workspaces
- When creating team or personal boards

## Notes

- New boards have no columns by default
- Use `fizzy_create_column` to add workflow stages
- Board creators are automatically admins

## Related Tools

- [fizzy_list_boards](/tools/boards/list-boards) - List all boards
- [fizzy_create_column](/tools/columns/create-column) - Add columns to the board
- [fizzy_create_card](/tools/cards/create-card) - Create cards on the board

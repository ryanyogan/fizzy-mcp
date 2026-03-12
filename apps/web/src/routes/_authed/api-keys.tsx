import { createFileRoute } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

export const Route = createFileRoute('/_authed/api-keys')({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  // TODO: Load API keys via server function
  const apiKeys: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    revokedAt: Date | null;
  }> = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage your API keys for accessing the MCP server
          </p>
        </div>
        <Button>Create API Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys are used to authenticate requests to the Fizzy MCP server. Keep your keys
            secure and never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-500"
                >
                  <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">No API keys yet</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Create your first API key to start using the Fizzy MCP server.
              </p>
              <Button className="mt-4">Create your first API key</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-neutral-100 px-2 py-1 text-sm dark:bg-neutral-800">
                        {key.keyPrefix}...
                      </code>
                    </TableCell>
                    <TableCell>{key.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {key.lastUsedAt ? key.lastUsedAt.toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {key.revokedAt ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : key.expiresAt && key.expiresAt < new Date() ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            To use your API key with the Fizzy MCP server, add it to your MCP client configuration:
          </p>
          <pre className="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
            <code>{`{
  "mcpServers": {
    "fizzy": {
      "url": "https://mcp.fizzy.yogan.dev/sse",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

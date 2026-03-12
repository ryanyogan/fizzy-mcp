import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export const Route = createFileRoute('/_authed/admin/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Configure system-wide settings for Fizzy MCP
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>Configure default rate limits for API usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="readLimit">Daily Read Limit (Anonymous)</Label>
              <Input id="readLimit" type="number" placeholder="100" defaultValue="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="writeLimit">Daily Write Limit (Anonymous)</Label>
              <Input id="writeLimit" type="number" placeholder="20" defaultValue="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authReadLimit">Daily Read Limit (Authenticated)</Label>
              <Input id="authReadLimit" type="number" placeholder="1000" defaultValue="1000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authWriteLimit">Daily Write Limit (Authenticated)</Label>
              <Input id="authWriteLimit" type="number" placeholder="500" defaultValue="500" />
            </div>
          </div>
          <Button>Save Rate Limits</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable system features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Anonymous Access</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Allow unauthenticated users to use the MCP server with rate limits
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Write Operations</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Allow write operations (create, update, delete) via MCP
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">New Registrations</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Allow new users to register accounts
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

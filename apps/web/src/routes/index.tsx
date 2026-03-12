import { Link, createFileRoute } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/theme-toggle';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Fizzy MCP
          </Link>
          <nav className="flex items-center gap-4">
            <a
              href="https://docs.fizzy.yogan.dev"
              className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Docs
            </a>
            <ThemeToggle />
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-28 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
          Now in public beta
        </div>
        <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-6xl lg:text-7xl">
          Connect your AI to{' '}
          <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400 bg-clip-text text-transparent dark:from-neutral-100 dark:via-neutral-400 dark:to-neutral-600">
            Fizzy
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          The official MCP server for Fizzy. Let Claude, Cursor, and other AI assistants manage your
          boards, cards, and tasks directly through natural conversation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <a href="https://docs.fizzy.yogan.dev">
            <Button variant="outline" size="lg">
              Documentation
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-24 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Everything you need
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              A complete MCP integration for Fizzy task management
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BoardsIcon />}
              title="Full Board Access"
              description="List, create, and manage boards. View columns and organize your workflow."
            />
            <FeatureCard
              icon={<CardsIcon />}
              title="Card Management"
              description="Create cards, update descriptions, assign tags, and move cards between columns."
            />
            <FeatureCard
              icon={<CommentsIcon />}
              title="Comments & Updates"
              description="Add comments, close cards, postpone tasks, and keep your team in sync."
            />
            <FeatureCard
              icon={<KeyIcon />}
              title="API Key Auth"
              description="Secure authentication with API keys. Track usage and manage access."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Usage Analytics"
              description="Monitor your API usage with detailed analytics and daily breakdowns."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Rate Limiting"
              description="Built-in rate limiting protects the service while allowing generous usage."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Get started in minutes
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Connect your AI assistant to Fizzy in three simple steps
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <StepCard
              number="1"
              title="Sign in & get your API key"
              description="Create an account and generate an API key from your dashboard."
            />
            <StepCard
              number="2"
              title="Configure your MCP client"
              description="Add the Fizzy MCP server to Claude Desktop, Cursor, or your preferred client."
            />
            <StepCard
              number="3"
              title="Start managing tasks"
              description="Ask your AI to create cards, update boards, and manage your workflow."
            />
          </div>
        </div>
      </section>

      {/* Code example */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-24 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Simple configuration
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Add Fizzy MCP to your client config
            </p>
          </div>
          <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 shadow-2xl dark:border-neutral-700">
            <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-neutral-700" />
              <div className="h-3 w-3 rounded-full bg-neutral-700" />
              <div className="h-3 w-3 rounded-full bg-neutral-700" />
              <span className="ml-3 text-sm text-neutral-500">claude_desktop_config.json</span>
            </div>
            <pre className="overflow-x-auto p-6 text-sm leading-relaxed text-neutral-300">
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
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Ready to get started?
          </h2>
          <p className="mb-10 text-neutral-600 dark:text-neutral-400">
            Sign in to create your API key and connect your AI assistant.
          </p>
          <Link to="/login">
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-600 dark:text-neutral-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Fizzy MCP</span>
            <span className="text-neutral-400 dark:text-neutral-600">/</span>
            <span>The official MCP server for Fizzy</span>
          </div>
          <div className="flex gap-6">
            <a
              href="https://docs.fizzy.yogan.dev"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              GitHub
            </a>
            <a
              href="https://fizzy.yogan.dev"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Fizzy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 text-lg font-semibold text-neutral-900 dark:border-neutral-100 dark:text-neutral-100">
        {number}
      </div>
      <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}

// Icons
function BoardsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
      <path d="M15 3v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function CommentsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

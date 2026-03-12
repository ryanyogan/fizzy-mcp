import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary';
import { NotFound } from '../components/NotFound';
import { ToastProvider } from '../components/ui/toast';

import appCss from '../styles.css?url';

// Script to prevent flash of wrong theme
const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || 'system';
    var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.add(isDark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Fizzy MCP' },
      { name: 'description', content: 'MCP server for Fizzy - manage your tasks with AI' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [{ children: THEME_SCRIPT }],
  }),
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <NotFound />
    </RootDocument>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white font-sans text-neutral-950 antialiased dark:bg-neutral-950 dark:text-neutral-50">
        <ToastProvider>{children}</ToastProvider>
        <Scripts />
      </body>
    </html>
  );
}

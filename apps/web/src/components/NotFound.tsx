import { Link } from '@tanstack/react-router';
import { Button } from './ui/button';

export function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        The page you're looking for doesn't exist.
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}

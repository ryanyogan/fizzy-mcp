import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { Button } from './ui/button';

export function DefaultCatchBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex gap-2">
        <Button
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button variant="outline" asChild>
            <Link to="/">Home</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
}

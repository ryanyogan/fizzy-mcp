import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { createAuth } from '../auth/server';

// Get current authenticated user
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: (session.user as { role?: string }).role ?? 'user',
  };
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

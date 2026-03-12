import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { ac, roles } from './permissions';

export function createAuth(env: Env) {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      usePlural: false,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minute cache
      },
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'user',
          input: false, // Don't allow users to set their own role
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // First user becomes admin
            const existingUsers = await db.select().from(schema.users).limit(1);
            if (existingUsers.length === 0) {
              return {
                data: {
                  ...user,
                  role: 'admin',
                },
              };
            }
            return { data: user };
          },
        },
      },
    },
    plugins: [
      adminPlugin({
        ac,
        roles,
        adminRoles: ['admin'],
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

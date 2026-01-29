import { z } from 'zod';
import { insertGameSchema, insertSessionSchema, insertEventSchema, games, sessions, events } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Member Lookup (Proxy to n8n)
  members: {
    lookup: {
      method: 'POST' as const,
      path: '/api/members/lookup',
      input: z.object({
        mobile: z.string(),
      }),
      // Response structure matches the webhook response roughly
      responses: {
        200: z.object({
          membershipSummary: z.object({
            total: z.number(),
            used: z.number(),
            balance: z.number(),
            isExpired: z.boolean(),
          }),
          history: z.object({
            purchases: z.array(z.object({ date: z.string(), item: z.string(), amount: z.number() })),
            activityLogs: z.array(z.object({ date: z.string(), activity: z.string() })),
          }),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  // Games
  games: {
    list: {
      method: 'GET' as const,
      path: '/api/games',
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof games.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/games',
      input: insertGameSchema,
      responses: {
        201: z.custom<typeof games.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  // Sessions
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions',
      responses: {
        200: z.array(z.custom<typeof sessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions',
      input: insertSessionSchema,
      responses: {
        201: z.custom<typeof sessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  // Calendar
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events',
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

import { z } from '@hono/zod-openapi';

export const PushSubscriptionSchema = z
  .object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  })
  .openapi('PushSubscription');

export const PushBroadcastSchema = z.object({
  title: z.string(),
  options: z
    .object({
      body: z.string().optional(),
    })
    .optional(),
});

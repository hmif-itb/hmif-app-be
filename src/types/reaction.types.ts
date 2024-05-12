import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { reactions } from '~/db/schema';

export const reactionSchema = createSelectSchema({
  ...reactions,
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Reaction');

export const reactionQuerySchema = z.object({
  infoId: z.string().optional(),
  commentId: z.string().optional(),
});

export const reactionCountSchema = z
  .object({
    reaction: z.string(),
    count: z.number(),
  })
  .array();

export const reactionResponseSchema = z.object({
  totalReactions: z.number(),
  reactionsCount: reactionCountSchema,
});

export const reactionIdSchema = z.object({
  reactionId: z.string(),
});

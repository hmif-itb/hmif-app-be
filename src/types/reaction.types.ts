import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { reactions } from '~/db/schema';

export const ReactionSchema = createSelectSchema(reactions, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Reaction');

export const CreateOrUpdateReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
  creatorId: true,
});

export const ReactionQuerySchema = z.object({
  infoId: z.string().optional(),
  commentId: z.string().optional(),
});

export const ReactionCountSchema = z
  .object({
    reaction: z.string(),
    count: z.number(),
  })
  .array();

export const ReactionResponseSchema = z.object({
  totalReactions: z.number(),
  reactionsCount: ReactionCountSchema,
});

export const ReactionIdSchema = z.object({
  reactionId: z.string(),
});

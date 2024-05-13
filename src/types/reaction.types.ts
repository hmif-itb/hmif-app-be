import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { reactions } from '~/db/schema';

export const ReactionSchema = createSelectSchema(reactions, {
  createdAt: z.union([z.string(), z.date()]),
})
  .openapi('Reaction')
  .omit({
    id: true,
    createdAt: true,
  });

export const CreateOrUpdateReactionSchema = createInsertSchema(reactions)
  .omit({
    id: true,
    createdAt: true,
  });


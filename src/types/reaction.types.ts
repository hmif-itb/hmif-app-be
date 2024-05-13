import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { reactions } from '~/db/schema';

export const ReactionSchema = createSelectSchema(reactions)
  .openapi('Reaction')
  .omit({
    id: true,
    createdAt: true,
  });

export const UpdateReactionSchema = createInsertSchema(reactions);

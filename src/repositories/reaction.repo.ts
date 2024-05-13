import { first } from '~/db/helper';
import { z } from 'zod';
import { reactions } from '~/db/schema';
import { UpdateReactionSchema } from '~/types/reaction.types';
import { Database } from '~/db/drizzle';

export async function updateReaction(
  db: Database,
  data: z.infer<typeof UpdateReactionSchema>,
  creatorId: string,
) {
  const reaction = await db
    .insert(reactions)
    .values({
      ...data,
      creatorId,
    })
    .onConflictDoUpdate({
      target: [reactions.infoId, reactions.commentId, reactions.creatorId],
      set: {
        ...data,
        creatorId,
      },
    })
    .returning()
    .then(first);
  return reaction;
}

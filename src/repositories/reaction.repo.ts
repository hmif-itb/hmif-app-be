import { first } from '~/db/helper';
import { z } from 'zod';
import { reactions } from '~/db/schema';
import { CreateOrUpdateReactionSchema } from '~/types/reaction.types';
import { Database } from '~/db/drizzle';

export async function createOrUpdateReaction(
  db: Database,
  data: z.infer<typeof CreateOrUpdateReactionSchema>,
  creatorId: string,
) {
  const reaction = await db
    .insert(reactions)
    .values({
      ...data,
      creatorId: creatorId,
    })
    .onConflictDoUpdate({
      target: [reactions.infoId, reactions.commentId, reactions.creatorId],
      set: {
        ...data,
        creatorId: creatorId,
      },
    })
    .returning()
    .then(first);
  return reaction;
}

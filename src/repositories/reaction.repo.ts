import { count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { reactions } from '~/db/schema';
import {
  reactionQuerySchema,
  reactionResponseSchema,
  reactionCountSchema,
} from '~/types/reaction.types';

export async function getReactions(
  db: Database,
  q: z.infer<typeof reactionQuerySchema>,
) {
  let where;
  if (q.infoId) {
    where = eq(reactions.infoId, q.infoId);
  } else if (q.commentId) {
    where = eq(reactions.commentId, q.commentId);
  } else {
    return null;
  }

  const reactionCount = await db
    .select({
      reaction: reactions.reaction,
      reactionsCount: count(reactions.reaction),
    })
    .from(reactions)
    .where(where)
    .groupBy(reactions.reaction);
  if (!reactionCount.length) return null; // No reactions found

  let total = 0;
  const reactionsMap: z.infer<typeof reactionCountSchema> = [];
  for (const r of reactionCount) {
    total += r.reactionsCount;
    reactionsMap.push({
      reaction: r.reaction,
      count: r.reactionsCount,
    });
  }

  const result: z.infer<typeof reactionResponseSchema> = {
    totalReactions: total,
    reactionsCount: reactionsMap,
  };

  return result;
}

export async function deleteReaction(db: Database, id: string) {
  return await db
    .delete(reactions)
    .where(eq(reactions.id, id))
    .returning()
    .then(firstSure);
}

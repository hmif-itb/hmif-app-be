import { count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { reactions } from '~/db/schema';
import {
  ReactionQuerySchema,
  ReactionResponseSchema,
  ReactionCountSchema,
} from '~/types/reaction.types';

export async function getReactions(
  db: Database,
  q: z.infer<typeof ReactionQuerySchema>,
) {
  const where = q.infoId
    ? eq(reactions.infoId, q.infoId)
    : q.commentId
      ? eq(reactions.commentId, q.commentId)
      : eq(reactions.id, '-1'); // Handle invalid query

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
  const reactionsMap: z.infer<typeof ReactionCountSchema> = [];
  for (const r of reactionCount) {
    total += r.reactionsCount;
    reactionsMap.push({
      reaction: r.reaction,
      count: r.reactionsCount,
    });
  }

  const result: z.infer<typeof ReactionResponseSchema> = {
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

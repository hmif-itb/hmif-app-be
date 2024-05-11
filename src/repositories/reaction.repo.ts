import { count, eq } from 'drizzle-orm';
import { z, ZodRecord } from 'zod';
import { Database } from '~/db/drizzle';
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
  let where = eq(reactions.commentId, q.commentId);
  if (q.infoId) {
    where = eq(reactions.infoId, q.infoId);
  }

  const reactionCount = await db
    .select({
      count: count(),
      reaction: reactions.reaction,
      reactionsCount: count(reactions.reaction),
    })
    .from(reactions)
    .where(where)
    .groupBy(reactions.reaction);

  const reactionsMap: z.infer<typeof reactionCountSchema> = [];
  for (const r of reactionCount) {
    reactionsMap.push({
      reaction: r.reaction,
      count: r.reactionsCount,
    });
  }

  const result: z.infer<typeof reactionResponseSchema> = {
    totalReactions: reactionCount[0].count,
    reactionsCount: reactionsMap,
  };

  return result;
}

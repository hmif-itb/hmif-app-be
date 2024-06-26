import { and, count, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { reactions } from '~/db/schema';
import {
  CreateOrUpdateReactionSchema,
  ReactionQuerySchema,
  ReactionResponseSchema,
} from '~/types/reaction.types';

export async function getReactions(
  db: Database,
  q: z.infer<typeof ReactionQuerySchema>,
  userId: string,
) {
  const where = q.infoId
    ? eq(reactions.infoId, q.infoId)
    : q.commentId
      ? eq(reactions.commentId, q.commentId)
      : eq(reactions.id, '-1'); // Handle invalid query

  const reactionCount = await db
    .select({
      reaction: reactions.reaction,
      count: count(reactions.reaction),
    })
    .from(reactions)
    .where(where)
    .groupBy(reactions.reaction);
  const userReaction = await db
    .select({
      reaction: reactions.reaction,
    })
    .from(reactions)
    .where(and(eq(reactions.creatorId, userId), where))
    .then(first);

  const result: z.infer<typeof ReactionResponseSchema> = {
    totalReactions: reactionCount.reduce((acc, r) => acc + r.count, 0),
    reactionsCount: reactionCount,
    userReaction: userReaction?.reaction,
  };

  return result;
}

export async function createOrUpdateReaction(
  db: Database,
  data: z.infer<typeof CreateOrUpdateReactionSchema>,
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
      set: data,
    })
    .returning()
    .then(first);
  return reaction;
}

export async function deleteReaction(
  db: Database,
  id: string,
  userId: string,
  type: 'comment' | 'info',
) {
  return await db
    .delete(reactions)
    .where(
      and(
        eq(reactions.creatorId, userId),
        type === 'comment'
          ? eq(reactions.commentId, id)
          : eq(reactions.infoId, id),
      ),
    )
    .returning()
    .then(firstSure);
}

/**
 * Get batch of comments reactions
 */
export async function getCommentsReactions(
  db: Database,
  commentIds: string[],
  userId: string,
) {
  if (commentIds.length === 0) {
    return {};
  }
  const where = inArray(reactions.commentId, commentIds);

  const reactionCount = await db
    .select({
      reaction: reactions.reaction,
      count: count(reactions.reaction),
      commentId: reactions.commentId,
    })
    .from(reactions)
    .where(where)
    .groupBy(reactions.reaction, reactions.commentId);
  const userReactions = await db
    .select({
      reaction: reactions.reaction,
      commentId: reactions.commentId,
    })
    .from(reactions)
    .where(and(eq(reactions.creatorId, userId), where));

  const result: Record<string, z.infer<typeof ReactionResponseSchema>> = {};
  reactionCount.forEach((r) => {
    if (!r.commentId) {
      return;
    }
    if (!result[r.commentId]) {
      result[r.commentId] = {
        totalReactions: 0,
        reactionsCount: [],
        userReaction: userReactions.find((ur) => ur.commentId === r.commentId)
          ?.reaction,
      };
    }
    result[r.commentId].totalReactions += r.count;
    result[r.commentId].reactionsCount.push({
      reaction: r.reaction,
      count: r.count,
    });
  });

  return result;
}

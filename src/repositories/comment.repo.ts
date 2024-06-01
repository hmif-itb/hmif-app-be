import { and, asc, desc, eq, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { comments, users } from '~/db/schema';
import {
  CommentIdParamSchema,
  CommentListQuerySchema,
  CommentPostBodySchema,
  CommentUpdateBodySchema,
} from '~/types/comment.types';
import { getCommentsReactions } from './reaction.repo';

export async function getCommentList(
  db: Database,
  q: z.infer<typeof CommentListQuerySchema>,
) {
  const infoIdQ = q.infoId ? eq(comments.repliedInfoId, q.infoId) : undefined;
  const sortQ =
    q.sort === 'oldest' ? asc(comments.createdAt) : desc(comments.createdAt);
  const where = and(infoIdQ);

  const result = await db
    .select({ ...getTableColumns(comments), creator: users })
    .from(comments)
    .where(where)
    .innerJoin(users, eq(users.id, comments.creatorId))
    .orderBy(sortQ)
    .groupBy(comments.id, users.id);

  const reactions = await getCommentsReactions(
    db,
    result.map((r) => r.id),
  );
  return result.map((r) => ({
    ...r,
    reactions: reactions[r.id] || [],
  }));
}

export async function getCommentById(
  db: Database,
  q: z.infer<typeof CommentIdParamSchema>,
) {
  return await db.query.comments.findFirst({
    where: eq(comments.id, q.commentId),
    with: {
      creator: true,
    },
  });
}

export async function updateCommentContent(
  db: Database,
  q: z.infer<typeof CommentIdParamSchema>,
  data: z.infer<typeof CommentUpdateBodySchema>,
) {
  return await db
    .update(comments)
    .set(data)
    .where(eq(comments.id, q.commentId))
    .returning()
    .then(first);
}

export async function createComment(
  db: Database,
  data: z.infer<typeof CommentPostBodySchema>,
  creatorId: string,
) {
  return await db
    .insert(comments)
    .values({ ...data, creatorId })
    .returning()
    .then(firstSure);
}

export async function deleteComment(db: Database, commentId: string) {
  return await db
    .delete(comments)
    .where(eq(comments.id, commentId))
    .returning()
    .then(first);
}

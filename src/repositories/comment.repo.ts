import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  InferInsertModel,
} from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { comments, reactions } from '~/db/schema';
import {
  CommentIdQuerySchema,
  CommentListQuerySchema,
} from '~/types/comment.types';
import { firstSure } from '~/db/helper';

export async function getCommentList(
  db: Database,
  q: z.infer<typeof CommentListQuerySchema>,
) {
  const infoIdQ = q.infoId ? eq(comments.repliedInfoId, q.infoId) : undefined;
  const sortQ =
    q.sort === 'popular'
      ? desc(count(reactions.commentId))
      : q.sort === 'oldest'
        ? asc(comments.createdAt)
        : desc(comments.createdAt);
  const where = and(infoIdQ);

  const result = await db
    .select({ ...getTableColumns(comments) })
    .from(comments)
    .where(where)
    .leftJoin(reactions, eq(reactions.commentId, comments.id))
    .orderBy(sortQ)
    .groupBy(comments.id);
  return result;
}

export async function getCommentById(
  db: Database,
  q: z.infer<typeof CommentIdQuerySchema>,
) {
  const result = await db.query.comments.findFirst({
    where: eq(comments.id, q.commentId),
  });
  return result;
}

export async function createComment(
  db: Database,
  data: Omit<InferInsertModel<typeof comments>, 'createdAt'>,
) {
  return await db.insert(comments).values(data).returning().then(firstSure);
}

export async function deleteComment(db: Database, commentId: string) {
  return await db.delete(comments).where(eq(comments.id, commentId));
}

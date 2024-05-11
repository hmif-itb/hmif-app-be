import { and, asc, count, desc, eq, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { comments, reactions } from '~/db/schema';
import {
  CommentContentSchema,
  CommentIdQuerySchema,
  CommentListQuerySchema,
} from '~/types/comment.types';

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
  return await db.query.comments.findFirst({
    where: eq(comments.id, q.commentId),
  });
}

export async function updateCommentContent(
  db: Database,
  q: z.infer<typeof CommentIdQuerySchema>,
  data: z.infer<typeof CommentContentSchema>,
) {
  const comment = await getCommentById(db, q);
  if (!comment) return null;
  return await db
    .update(comments)
    .set(data)
    .where(eq(comments.id, q.commentId))
    .returning()
    .then(firstSure);
}

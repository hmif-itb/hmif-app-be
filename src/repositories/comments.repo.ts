import { InferInsertModel, eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { comments } from '~/db/schema';


export async function createComment(
  db: Database,
  data: Omit<InferInsertModel<typeof comments>, 'createdAt'>,
) {
  return await db
    .insert(comments)
    .values(data)
    .returning()
    .then(firstSure);
}

export async function deleteComment(
    db: Database,
    commentId: string,
) {
    return await db
        .delete(comments)
        .where(eq(comments.id, commentId))
}

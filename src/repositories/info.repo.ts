import { InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { infoMedias, infos } from '~/db/schema';

/**
 * Create an info.
 */
export async function createInfo(
  db: Database,
  data: Omit<InferInsertModel<typeof infos>, 'createdAt'>,
  userId: string,
  mediaIds: string[],
) {
  const create = await db
    .insert(infos)
    .values({
      ...data,
      creatorId: userId,
    })
    .onConflictDoUpdate({
      set: data,
      target: [infos.id],
    })
    .returning()
    .then(firstSure);

  if (mediaIds.length) {
    await db
      .insert(infoMedias)
      .values(mediaIds.map((mediaId) => ({ infoId: create.id, mediaId })))
      .execute();
  }
  return create;
}

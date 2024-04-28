import { InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { infoMedias, infos, userReadInfos } from '~/db/schema';

/**
 * Create an info.
 */
export async function createInfo(
  db: Database,
  data: Omit<InferInsertModel<typeof infos>, 'createdAt'>,
  mediaIds: string[],
) {
  const create = await db
    .insert(infos)
    .values({
      ...data,
    })
    .onConflictDoUpdate({
      set: data,
      target: [infos.id],
    })
    .returning()
    .then(firstSure);

  if (mediaIds.length > 0) {
    await db
      .insert(infoMedias)
      .values(mediaIds.map((mediaId) => ({ infoId: create.id, mediaId })))
      .execute();
  }
  return create;
}

export async function createReadInfo(
  db: Database,
  data: Omit<InferInsertModel<typeof userReadInfos>, 'createdAt'>,
) {
  return await db
    .insert(userReadInfos)
    .values(data)
    .returning()
    .then(firstSure);
}

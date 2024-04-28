import { InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { infos, userReadInfos } from '~/db/schema';
import {
  createInfoMediaTransaction,
  createMediaFromUrlTransaction,
} from './media.repo';

/**
 * Create an info.
 */
export async function createInfo(
  db: Database,
  data: Omit<InferInsertModel<typeof infos>, 'createdAt'>,
  mediaUrls: string[] | undefined,
) {
  return await db.transaction(async (tx) => {
    try {
      const newInfo = await tx
        .insert(infos)
        .values(data)
        .returning()
        .then(firstSure);

      if (mediaUrls) {
        const newMedias = await Promise.all(
          mediaUrls.map(async (mediaUrl) => {
            return await createMediaFromUrlTransaction(
              tx,
              mediaUrl,
              newInfo.creatorId,
            );
          }),
        );

        await Promise.all(
          newMedias.map(async (media) => {
            return await createInfoMediaTransaction(tx, {
              infoId: newInfo.id,
              mediaId: media.id,
            });
          }),
        );
      }
      return newInfo;
    } catch (err) {
      try {
        // Ini hack biar kalo rollback gagal, errornya tetep di throw
        tx.rollback();
      } catch (err2) {
        throw err;
      }
    }
  });
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

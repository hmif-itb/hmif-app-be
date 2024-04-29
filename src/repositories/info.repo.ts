import { InferInsertModel, SQL, and, eq, ilike, notInArray } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { infos, userReadInfos } from '~/db/schema';
import { ListInfoParamsSchema } from '~/types/info.types';
import {
  createInfoMediaTransaction,
  createMediaFromUrlTransaction,
} from './media.repo';

const INFOS_PER_PAGE = 10;

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

export async function getListInfos(
  db: Database,
  q: z.infer<typeof ListInfoParamsSchema>,
  userId: string,
) {
  const searchQ = q.search ? ilike(infos.content, `%${q.search}%`) : undefined;
  const categoryQ = q.category ? eq(infos.category, q.category) : undefined;
  let unreadQ: SQL<unknown> | undefined;

  if (q.unread === 'true') {
    const getReadInfosByUser = db
      .select({ infoId: userReadInfos.infoId })
      .from(userReadInfos)
      .where(eq(userReadInfos.userId, userId));
    unreadQ = notInArray(infos.id, getReadInfosByUser);
  }

  const where = and(searchQ, categoryQ, unreadQ);

  return await db.query.infos.findMany({
    where,
    limit: INFOS_PER_PAGE,
    offset: q.offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

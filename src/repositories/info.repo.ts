import { eq, and, like, notInArray, InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { infos, userReadInfos } from '~/db/schema';
import { firstSure } from '~/db/helper';
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

export async function GetListInfosSearchCategoryUnread(
  db: Database,
  userId: string,
  search: string,
  category: string,
  offset: number,
) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));
  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
      eq(infos.category, category),
      notInArray(infos.id, getReadInfosByUser),
    ),
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

export async function GetListInfosSearchCategory(
  db: Database,
  search: string,
  category: string,
  offset: number,
) {
  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
      eq(infos.category, category), // Filter by category
    ),
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

export async function GetListInfosSearchUnread(
  db: Database,
  search: string,
  userId: string,
  offset: number,
) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));

  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
      notInArray(infos.id, getReadInfosByUser),
    ),
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

export async function GetListInfosSearch(
  db: Database,
  search: string,
  offset: number,
) {
  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
    ),
    limit: 20,
    offset,
    with: {
      infoMedias: true,
    },
  });
}

export async function GetListInfosCategoryUnread(
  db: Database,
  userId: string,
  category: string,
  offset: number,
) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));
  return await db.query.infos.findMany({
    where: and(
      eq(infos.category, category),
      notInArray(infos.id, getReadInfosByUser),
    ),
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

export async function GetListInfosCategory(
  db: Database,
  category: string,
  offset: number,
) {
  return await db.query.infos.findMany({
    where: eq(infos.category, category),
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

export async function GetListInfosUnread(
  db: Database,
  userId: string,
  offset: number,
) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));
  return await db.query.infos.findMany({
    where: notInArray(infos.id, getReadInfosByUser),
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

export async function GetAllListInfos(db: Database, offset: number) {
  return await db.query.infos.findMany({
    limit: 20,
    offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

import { eq, and, like, notInArray } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { infos, userReadInfos } from '~/db/schema';

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
    limit: 10,
    offset: offset,
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
    limit: 10,
    offset: offset,
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
    limit: 10,
    offset: offset,
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
    limit: 10,
    offset: offset,
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
    limit: 10,
    offset: offset,
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
    limit: 10,
    offset: offset,
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
    limit: 10,
    offset: offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
    },
  });
}

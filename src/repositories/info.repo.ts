import { eq, and, like, notExists, not, notInArray } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { infos, userReadInfos } from '~/db/schema';

export async function GetListInfosSearchCategoryUnread(
  db: Database,
  userId: string,
  search: string,
  category: string,
) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));
  console.log(getReadInfosByUser);
  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
      eq(infos.category, category),
      notInArray(infos.id, getReadInfosByUser),
    ),
    with: {
      infoMedias: true,
    },
  });
}

export async function GetListInfosSearchCategory(
  db: Database,
  search: string,
  category: string,
) {
  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
      eq(infos.category, category), // Filter by category
    ),
    with: {
      infoMedias: true,
    },
  });
}

export async function GetListInfosSearch(db: Database, search: string) {
  return await db.query.infos.findMany({
    where: and(
      like(infos.content, `%${search}%`), // Search by content
    ),
    with: {
      infoMedias: true,
    },
  });
}

export async function GetListInfosCategoryUnread(
  db: Database,
  userId: string,
  category: string,
) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));
  console.log(getReadInfosByUser);
  return await db.query.infos.findMany({
    where: and(
      eq(infos.category, category),
      notInArray(infos.id, getReadInfosByUser),
    ),
    with: {
      infoMedias: true,
    },
  });
}

export async function GetListInfosCategory(db: Database, category: string) {
  return await db.query.infos.findMany({
    where: eq(infos.category, category),
    with: {
      infoMedias: true,
    },
  });
}

export async function GetListInfosUnread(db: Database, userId: string) {
  const getReadInfosByUser = db
    .select({ infoId: userReadInfos.infoId })
    .from(userReadInfos)
    .where(and(eq(userReadInfos.userId, userId)));
  return await db.query.infos.findMany({
    where: notInArray(infos.id, getReadInfosByUser),
    with: {
      infoMedias: true,
    },
  });
}

export async function GetAllListInfos(db: Database) {
  return await db.query.infos.findMany({
    with: {
      infoMedias: true,
    },
  });
}

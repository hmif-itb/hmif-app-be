import { eq, and, like, notExists, exists, } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { infos, userReadInfos } from '~/db/schema';

export async function GetListInfosSearchCategoryUnread(db: Database, userId: string, infoId: string, search: string, category: string) {
    const getReadInfosByUser = db.select().from(userReadInfos).where(
        and(
            eq(userReadInfos.userId, userId),
            eq(userReadInfos.infoId, infoId)
        )
    )
    return await db.query.infos.findMany({
        where: and(
            like(infos.content, `%${search}%`), // Search by content
            eq(infos.category, category),
            notExists(getReadInfosByUser)
        ),
        with : {
            medias: true
        }
    });
}

export async function GetListInfosSearchCategory(db: Database, search: string, category: string) {
    return await db.query.infos.findMany({
        where: and(
            like(infos.content, `%${search}%`), // Search by content
            eq(infos.category, category) // Filter by category
        ),
        with : {
            medias: true
        }
    });
}

export async function GetListInfosCategoryUnread(db: Database, userId: string, infoId: string, category: string) {
    const getReadInfosByUser = db.select().from(userReadInfos).where(
        and(
            eq(userReadInfos.userId, userId),
            eq(userReadInfos.infoId, infoId)
        )
    )
    return await db.query.infos.findMany({
        where: and(
            eq(infos.category, category),
            notExists(getReadInfosByUser)
        ),
        with : {
            medias: true
        }
    });
}

export async function GetListInfosCategory(db: Database, category: string) {
    return await db.query.infos.findMany({
        where: eq(infos.category, category),
        with : {
            medias: true
        }
    });
}

export async function GetListInfosUnread(db: Database, userId: string, infoId: string) {
    const getReadInfosByUser = db.select().from(userReadInfos).where(
        and(
            eq(userReadInfos.userId, userId),
            eq(userReadInfos.infoId, infoId)
        )
    )
    return await db.query.infos.findMany({
        where: notExists(getReadInfosByUser),
        with: {
            medias: true
        }
    });
}

export async function GetAllListInfos(db: Database) {
    return await db.query.infos.findMany({
        with: {
            medias: true
        }
    });
}
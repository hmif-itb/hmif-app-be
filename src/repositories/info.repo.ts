import {
  InferInsertModel,
  SQL,
  and,
  eq,
  ilike,
  inArray,
  notInArray,
} from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import {
  categories,
  infoAngkatan,
  infoCategories,
  infoCourses,
  infoMedias,
  infos,
  userReadInfos,
} from '~/db/schema';
import { CreateInfoBodySchema, ListInfoParamsSchema } from '~/types/info.types';
import { createMediasFromUrl } from './media.repo';
import { getReactions } from './reaction.repo';

const INFOS_PER_PAGE = 10;

/**
 * Create an info.
 */
export async function createInfo(
  db: Database,
  data: Omit<InferInsertModel<typeof infos>, 'createdAt'>,
  mediaUrls: z.infer<typeof CreateInfoBodySchema.shape.mediaUrls>,
  forAngkatan: z.infer<typeof CreateInfoBodySchema.shape.forAngkatan>,
  forCategories: z.infer<typeof CreateInfoBodySchema.shape.forCategories>,
  forCourses: z.infer<typeof CreateInfoBodySchema.shape.forCourses>,
) {
  // transaction drizzle auto rollback kalo error
  return await db.transaction(async (tx) => {
    const newInfo = await tx
      .insert(infos)
      .values(data)
      .returning()
      .then(firstSure);

    // Attach categories to the info with InfoCategory
    await createInfoCategory(
      tx,
      forCategories.map((categoryId) => ({
        infoId: newInfo.id,
        categoryId,
      })),
    );

    // If mediaUrls is supplied, then create those Media and attach them to the info with InfoMedia
    if (mediaUrls && mediaUrls.length > 0) {
      const newMedias = await createMediasFromUrl(
        tx,
        mediaUrls,
        newInfo.creatorId,
      );

      await createInfoMedia(
        tx,
        newMedias.map((media) => ({
          infoId: newInfo.id,
          mediaId: media.id,
        })),
      );
    }

    // If forAngkatan is supplied, then attach angkatan to the info with InfoAngkatan
    if (forAngkatan && forAngkatan.length > 0) {
      await createInfoAngkatan(
        tx,
        forAngkatan.map((angkatanId) => ({
          infoId: newInfo.id,
          angkatanId,
        })),
      );
    }

    // If forCourses is supplied, then attach courses to the info with InfoCourses
    if (forCourses && forCourses.length > 0) {
      await createInfoCourses(
        tx,
        forCourses.map((course) => ({
          infoId: newInfo.id,
          courseId: course.courseId,
          class: course.class,
        })),
      );
    }

    return newInfo;
  });
}

export const createInfoCategory = async (
  db: Database,
  data: Array<InferInsertModel<typeof infoCategories>>,
) => {
  return await db
    .insert(infoCategories)
    .values(data)
    .returning()
    .then(firstSure);
};

export const createInfoMedia = async (
  db: Database,
  data: Array<Omit<InferInsertModel<typeof infoMedias>, 'createdAt'>>,
) => {
  return await db.insert(infoMedias).values(data).returning().then(firstSure);
};

export const createInfoAngkatan = async (
  db: Database,
  data: Array<InferInsertModel<typeof infoAngkatan>>,
) => {
  return await db.insert(infoAngkatan).values(data).returning().then(firstSure);
};

export const createInfoCourses = async (
  db: Database,
  data: Array<InferInsertModel<typeof infoCourses>>,
) => {
  return await db.insert(infoCourses).values(data).returning().then(firstSure);
};

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

export async function deleteInfo(db: Database, id: string) {
  const info = await db
    .delete(infos)
    .where(eq(infos.id, id))
    .returning()
    .then(first);
  return info;
}

// TODO: get reaction counts
export async function getListInfos(
  db: Database,
  q: z.infer<typeof ListInfoParamsSchema>,
  userId: string,
) {
  const searchQ = q.search ? ilike(infos.content, `%${q.search}%`) : undefined;
  let unreadQ: SQL<unknown> | undefined;
  let categoryQ: SQL<unknown> | undefined;

  if (q.unread === 'true') {
    const getReadInfosByUser = db
      .select({ infoId: userReadInfos.infoId })
      .from(userReadInfos)
      .where(eq(userReadInfos.userId, userId));
    unreadQ = notInArray(infos.id, getReadInfosByUser);
  }

  if (q.category) {
    const getInfosByCategory = db
      .select({ infoId: infoCategories.infoId })
      .from(infos)
      .innerJoin(infoCategories, eq(infoCategories.infoId, infos.id))
      .innerJoin(categories, eq(infoCategories.categoryId, categories.id))
      .where(eq(categories.name, q.category));
    categoryQ = inArray(infos.id, getInfosByCategory);
  }

  const where = and(searchQ, categoryQ, unreadQ);

  let listInfo = await db.query.infos.findMany({
    where,
    limit: INFOS_PER_PAGE,
    offset: q.offset,
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
      infoCategories: {
        with: {
          category: true,
        },
      },
      infoCourses: {
        with: {
          course: true,
        },
      },
      infoAngkatan: {
        with: {
          angkatan: true,
        },
      },
      creator: true,
    },
  });

  listInfo = await Promise.all(
    listInfo.map(async (info) => {
      const reactions = await getReactions(db, { infoId: info?.id }, userId);
      return { ...info, reactions };
    }),
  );

  // Sort based on 'sort' query params
  if (q.sort) {
    listInfo = listInfo.sort((a, b) => {
      if (q.sort === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  }

  return listInfo;
}

export async function getInfoById(db: Database, id: string, userId: string) {
  const info = await db.query.infos.findFirst({
    where: eq(infos.id, id),
    with: {
      infoMedias: {
        with: {
          media: true,
        },
      },
      infoCategories: {
        with: {
          category: true,
        },
      },
      infoCourses: {
        with: {
          course: true,
        },
      },
      infoAngkatan: {
        with: {
          angkatan: true,
        },
      },
      creator: true,
    },
  });

  if (!info) return info;

  // If user is found, then add reactions to the object
  const reactions = await getReactions(db, { infoId: info?.id }, userId);
  return { ...info, reactions };
}

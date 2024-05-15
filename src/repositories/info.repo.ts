import { InferInsertModel, SQL, and, eq, ilike, notInArray } from 'drizzle-orm';
import { z } from 'zod';
import { Database, db } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import {
  infoAngkatan,
  infoCategories,
  infoCourses,
  infoMedias,
  infos,
  userReadInfos,
} from '~/db/schema';
import { CreateInfoBodySchema, ListInfoParamsSchema } from '~/types/info.types';
import { createMediasFromUrl } from './media.repo';

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
    if (mediaUrls) {
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
    if (forAngkatan) {
      await createInfoAngkatan(
        tx,
        forAngkatan.map((angkatanId) => ({
          infoId: newInfo.id,
          angkatanId,
        })),
      );
    }

    // If forCourses is supplied, then attach courses to the info with InfoCourses
    if (forCourses) {
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

// TODO: Recreate this!!
// export async function getListInfos(
//   db: Database,
//   q: z.infer<typeof ListInfoParamsSchema>,
//   userId: string,
// ) {
//   const searchQ = q.search ? ilike(infos.content, `%${q.search}%`) : undefined;
//   const categoryQ = q.category ? eq(infos.category, q.category) : undefined;
//   let unreadQ: SQL<unknown> | undefined;

//   if (q.unread === 'true') {
//     const getReadInfosByUser = db
//       .select({ infoId: userReadInfos.infoId })
//       .from(userReadInfos)
//       .where(eq(userReadInfos.userId, userId));
//     unreadQ = notInArray(infos.id, getReadInfosByUser);
//   }

//   const where = and(searchQ, categoryQ, unreadQ);

//   return await db.query.infos.findMany({
//     where,
//     limit: INFOS_PER_PAGE,
//     offset: q.offset,
//     with: {
//       infoMedias: {
//         with: {
//           media: true,
//         },
//       },
//     },
//   });
// }

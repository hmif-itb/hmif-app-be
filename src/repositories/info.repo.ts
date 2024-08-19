import {
  and,
  eq,
  ilike,
  inArray,
  InferInsertModel,
  notInArray,
  or,
  sql,
  SQL,
} from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import {
  angkatan,
  categories,
  Info,
  infoAngkatan,
  infoCategories,
  infoCourses,
  infoMedias,
  infos,
  userCourses,
  userReadInfos,
  users,
  userUnsubscribeCategories,
} from '~/db/schema';
import { CreateInfoBodySchema, ListInfoParamsSchema } from '~/types/info.types';
import { createMediasFromUrl } from './media.repo';
import { getReactions } from './reaction.repo';
import { getCurrentSemesterCodeAndYear } from '~/repositories/course.repo';
import {
  getPushSubscriptionsByUserIds,
  removeFailedPushSubscriptions,
} from '~/repositories/push.repo';
import { sendNotificationToAll } from '~/lib/push-manager';

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
    .onConflictDoNothing()
    .returning()
    .then(firstSure);
}

export async function deleteInfo(db: Database, id: string) {
  return await db.delete(infos).where(eq(infos.id, id)).returning().then(first);
}

// TODO: get reaction counts
export async function getListInfos(
  db: Database,
  q: z.infer<typeof ListInfoParamsSchema>,
  userId: string,
) {
  const searchPhrase = q.search ? q.search.split(' ').join(' & ') : undefined;
  const searchQ = q.search
    ? sql`to_tsvector('indonesian', ${infos.content}) @@ plainto_tsquery('indonesian', ${searchPhrase})`
    : undefined;
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

export async function notifyNewInfo(
  db: Database,
  info: Info,
  mediaUrls: z.infer<typeof CreateInfoBodySchema.shape.mediaUrls>,
  forAngkatan: z.infer<typeof CreateInfoBodySchema.shape.forAngkatan>,
  forCategories: z.infer<typeof CreateInfoBodySchema.shape.forCategories>,
  forCourses: z.infer<typeof CreateInfoBodySchema.shape.forCourses>,
) {
  let receivers: string[] = [];

  if (forCategories.length === 0 && (!forCourses || forCourses.length === 0)) {
    return;
  }

  let unsubs: string[] = [];

  if (forCategories.length > 0) {
    unsubs = await db
      .selectDistinct({ userId: userUnsubscribeCategories.userId })
      .from(userUnsubscribeCategories)
      .where(inArray(userUnsubscribeCategories.categoryId, forCategories))
      .then((res) => res.map((r) => r.userId));
  }

  if (forCourses && forCourses.length > 0) {
    const { semesterCodeTaken, semesterYearTaken } =
      getCurrentSemesterCodeAndYear();
    receivers = await db
      .selectDistinct({ userId: userCourses.userId })
      .from(userCourses)
      .where(
        and(
          or(
            inArray(
              userCourses.courseId,
              forCourses
                .filter((c) => c.class === undefined)
                .map((c) => c.courseId),
            ),
            ...forCourses
              .filter((c) => c.class !== undefined)
              .map((c) =>
                and(
                  eq(userCourses.courseId, c.courseId),
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  eq(userCourses.class, c.class!),
                ),
              ),
          ),
          eq(userCourses.semesterCodeTaken, semesterCodeTaken),
          eq(userCourses.semesterYearTaken, semesterYearTaken),
          unsubs.length ? notInArray(userCourses.userId, unsubs) : undefined,
        ),
      )
      .then((res) => res.map((r) => r.userId));
  } else if (forAngkatan && forAngkatan.length > 0) {
    receivers = await db
      .selectDistinct({ userId: users.id })
      .from(users)
      .innerJoin(angkatan, eq(users.angkatan, angkatan.year))
      .where(
        and(
          inArray(angkatan.id, forAngkatan),
          unsubs.length ? notInArray(users.id, unsubs) : undefined,
        ),
      )
      .then((res) => res.map((r) => r.userId));
  } else {
    receivers = await db
      .selectDistinct({ userId: users.id })
      .from(users)
      .where(unsubs.length ? notInArray(users.id, unsubs) : undefined)
      .then((res) => res.map((r) => r.userId));
  }

  const subscriptions = await getPushSubscriptionsByUserIds(db, receivers);

  if (subscriptions.length === 0) {
    return;
  }

  // Send notification to all users
  await sendNotificationToAll(
    subscriptions,
    {
      title: info.title,
      options: {
        body: info.content,
        data: {
          url: `/timeline/${info.id}`,
        },
      },
    },
    {
      urgency: 'high',
    },
  ).then(async (results) => {
    await removeFailedPushSubscriptions(db, results);
  });
}

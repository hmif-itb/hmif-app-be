import { and, asc, eq, inArray, sql, SQL } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { competitionMedias, competitions } from '~/db/schema';
import {
  CompetitionListQuerySchema,
  CreateCompetitionSchema,
  UpdateCompetitionBodySchema,
} from '~/types/competitions.types';
import { createMediasFromUrl } from './media.repo';

const COMPETITIONS_PER_PAGE = 10;

export const createCompetition = async (
  db: Database,
  data: z.infer<typeof CreateCompetitionSchema>,
  userId: string,
) => {
  return await db.transaction(async (trx) => {
    const competition = await trx
      .insert(competitions)
      .values(data)
      .returning()
      .then(firstSure);

    if (data.mediaUrls && data.mediaUrls.length > 0) {
      const newMedias = await createMediasFromUrl(trx, data.mediaUrls, userId);
      await trx.insert(competitionMedias).values(
        newMedias.map((media, idx) => ({
          competitionId: competition.id,
          mediaId: media.id,
          order: idx,
        })),
      );
    }
    return competition;
  });
};

export const updateCompetition = async (
  db: Database,
  id: string,
  data: z.infer<typeof UpdateCompetitionBodySchema>,
  userId: string,
) => {
  return await db.transaction(async (trx) => {
    const competition = await trx
      .update(competitions)
      .set(data)
      .where(eq(competitions.id, id))
      .returning()
      .then(firstSure);

    if (data.mediaUrls) {
      await trx
        .delete(competitionMedias)
        .where(eq(competitionMedias.competitionId, id));
      if (data.mediaUrls.length > 0) {
        const newMedias = await createMediasFromUrl(
          trx,
          data.mediaUrls,
          userId,
        );
        await trx.insert(competitionMedias).values(
          newMedias.map((media, idx) => ({
            competitionId: competition.id,
            mediaId: media.id,
            order: idx,
          })),
        );
      }
    }

    return competition;
  });
};

export const getCompetitionById = async (db: Database, id: string) => {
  const competition = await db.query.competitions.findFirst({
    where: eq(competitions.id, id),
    with: {
      medias: {
        with: {
          media: true,
        },
        orderBy: asc(competitionMedias.order),
      },
    },
  });

  return competition;
};

export async function getCompetitionsList(
  db: Database,
  q: z.infer<typeof CompetitionListQuerySchema>,
) {
  let categoryQ: SQL<unknown> | undefined;

  if (q.category) {
    const getCompeitionsByCategory = db
      .select({ competitionsId: competitions.id })
      .from(competitions)
      .where(sql`${competitions.categories} @> ${q.category}`);
    categoryQ = inArray(competitions.id, getCompeitionsByCategory);
  }

  const activeQ = sql`${competitions.registrationDeadline} > now()`;

  const where = and(categoryQ, activeQ);
  const listCompetitions = await db.query.competitions.findMany({
    where,
    limit: COMPETITIONS_PER_PAGE,
    offset: q.offset,
    orderBy:
      q.sort === 'deadline'
        ? [asc(competitions.registrationDeadline), asc(competitions.createdAt)]
        : asc(competitions.createdAt),
    with: {
      medias: {
        with: {
          media: true,
        },
        orderBy: asc(competitionMedias.order),
      },
    },
  });

  return listCompetitions;
}

export async function deleteCompetition(db: Database, competitionId: string) {
  return await db
    .delete(competitions)
    .where(eq(competitions.id, competitionId))
    .returning()
    .then(first);
}

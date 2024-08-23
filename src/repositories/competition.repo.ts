import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { competitions } from '~/db/schema';
import {
  CreateCompetitionSchema,
  UpdateCompetitionBodySchema,
} from '~/types/competition.types';

export const createCompetition = async (
  db: Database,
  data: z.infer<typeof CreateCompetitionSchema>,
) => {
  const competition = await db
    .insert(competitions)
    .values(data)
    .returning()
    .then(firstSure);

  return competition;
};

export const updateCompetition = async (
  db: Database,
  id: string,
  data: z.infer<typeof UpdateCompetitionBodySchema>,
) => {
  const competition = await db
    .update(competitions)
    .set(data)
    .where(eq(competitions.id, id))
    .returning()
    .then(firstSure);

  return competition;
};

export const getCompetitionById = async (db: Database, id: string) => {
  const competition = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id))
    .then(firstSure);

  return competition;
};

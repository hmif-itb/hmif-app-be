import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { competitions } from '~/db/schema';
import { CreateCompetitionSchema } from '~/types/competition.types';

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

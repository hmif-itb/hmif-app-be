import { PostgresError } from 'postgres';
import { createAuthRouter } from './router-factory';
import { db } from '~/db/drizzle';
import {
  createCompetition,
  getCompetitionById,
  updateCompetition,
} from '~/repositories/competition.repo';
import {
  createCompetitionRoute,
  updateCompetitionRoute,
} from '~/routes/competition.route';

export const competitionRouter = createAuthRouter();

competitionRouter.openapi(createCompetitionRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const competition = await createCompetition(db, data);
    return c.json(competition, 201);
  } catch (err) {
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

competitionRouter.openapi(updateCompetitionRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');

    // Check if competition exists
    const existingCompetition = await getCompetitionById(db, id ?? '');
    if (!existingCompetition)
      return c.json({ error: 'Competition not found' }, 404);

    const data = c.req.valid('json');
    const competition = await updateCompetition(db, id ?? '', data);
    return c.json(competition, 200);
  } catch (err) {
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

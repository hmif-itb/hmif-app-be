import { PostgresError } from 'postgres';
import { createAuthRouter } from './router-factory';
import { db } from '~/db/drizzle';
import { createCompetition } from '~/repositories/competition.repo';
import { createCompetitionRoute } from '~/routes/competition.route';

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

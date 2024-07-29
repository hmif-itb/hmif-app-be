import { db } from '~/db/drizzle';
import { getCompetitionListRoute, deleteCompetitionRoute } from '~/routes/competitions.route';
import { getCompetitionsList, deleteCompetition } from '~/repositories/competitions.repo';
import { createAuthRouter } from './router-factory';

export const competitionsRouter = createAuthRouter();

competitionsRouter.openapi(getCompetitionListRoute, async (c) => {
    const query = c.req.valid('query');
    const competitions = await getCompetitionsList(db, query);
    return c.json({
     competitions
    }, 200);
  });

competitionsRouter.openapi(deleteCompetitionRoute, async (c) => {
    try {
      const { competitionId } = c.req.valid('param');
      const competition = await deleteCompetition(db, competitionId);
      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }
      return c.json({ ...competition }, 200);
    } catch (err) {
      return c.json({error: err}, 500);
    }
  });
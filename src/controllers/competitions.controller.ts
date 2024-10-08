import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { competitionCategories } from '~/db/schema';
import { roleMiddleware } from '~/middlewares/role.middleware';
import {
  createCompetition,
  deleteCompetition,
  getCompetitionById,
  getCompetitionsList,
  updateCompetition,
} from '~/repositories/competitions.repo';
import {
  createCompetitionRoute,
  deleteCompetitionRoute,
  getCompetitionCategoriesRoute,
  getCompetitionListRoute,
  updateCompetitionRoute,
} from '~/routes/competitions.route';
import { createAuthRouter } from './router-factory';

export const competitionsRouter = createAuthRouter();

competitionsRouter.openapi(getCompetitionCategoriesRoute, async (c) => {
  c.header('Cache-Control', 'public, max-age=3600');

  return c.json([...competitionCategories], 200);
});

competitionsRouter.post(
  createCompetitionRoute.getRoutingPath(),
  roleMiddleware(['cnc']),
);
competitionsRouter.openapi(createCompetitionRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const competition = await createCompetition(db, data, c.var.user.id);
    return c.json(competition, 201);
  } catch (err) {
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

competitionsRouter.put(
  updateCompetitionRoute.getRoutingPath(),
  roleMiddleware(['cnc']),
);
competitionsRouter.openapi(updateCompetitionRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');

    // Check if competition exists
    const existingCompetition = await getCompetitionById(db, id);
    if (!existingCompetition)
      return c.json({ error: 'Competition not found' }, 404);

    const data = c.req.valid('json');
    const competition = await updateCompetition(db, id, data, c.var.user.id);
    return c.json(competition, 200);
  } catch (err) {
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

competitionsRouter.openapi(getCompetitionListRoute, async (c) => {
  const query = c.req.valid('query');
  const competitions = await getCompetitionsList(db, query);
  return c.json(
    {
      competitions,
    },
    200,
  );
});

competitionsRouter.delete(
  deleteCompetitionRoute.getRoutingPath(),
  roleMiddleware(['cnc']),
);
competitionsRouter.openapi(deleteCompetitionRoute, async (c) => {
  const { competitionId } = c.req.valid('param');
  const competition = await deleteCompetition(db, competitionId);
  if (!competition) {
    return c.json({ error: 'Competition not found' }, 404);
  }
  return c.json({ ...competition }, 200);
});

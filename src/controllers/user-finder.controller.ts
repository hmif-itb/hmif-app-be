import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { getUserByNimOrName } from '~/repositories/user-finder.repo';
import { getUserRoute } from '~/routes/user-finder.route';
import { createAuthRouter } from './router-factory';

export const userFinderRouter = createAuthRouter();

userFinderRouter.openapi(getUserRoute, async (c) => {
  const q = c.req.valid('query');

  try {
    const users = await getUserByNimOrName(db, q);
    return c.json(users, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

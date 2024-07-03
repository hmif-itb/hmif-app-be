import { getUserRoute } from '~/routes/user-finder.route';
import { createAuthRouter } from './router-factory';
import { db } from '~/db/drizzle';
import { getUserByNimOrName } from '~/repositories/user-finder.repo';
import { PostgresError } from 'postgres';

export const userFinderRouter = createAuthRouter();

userFinderRouter.openapi(getUserRoute, async (c) => {
  const q = c.req.valid('query');

  try {
    const user = await getUserByNimOrName(db, q);
    if (!user.length) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

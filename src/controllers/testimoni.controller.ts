import { db } from '~/db/drizzle';
import { postTestimoniRoute } from '~/routes/testimoni.route';
import { createAuthRouter } from './router-factory';
import { createTestimoni } from '~/repositories/testimoni.repo';

export const testimoniRoute = createAuthRouter();

testimoniRoute.openapi(postTestimoniRoute, async (c) => {
  const data = c.req.valid('json');
  const res = await createTestimoni(db, data, c.var.user.id);
  return c.json(res, 200);
});

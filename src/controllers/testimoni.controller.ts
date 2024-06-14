import { db } from '~/db/drizzle';
import {
  postTestimoniRoute,
  getTestiByCourseIdRoute,
} from '~/routes/testimoni.route';
import { createAuthRouter } from './router-factory';
import {
  createTestimoni,
  getTestiByCourseId,
} from '~/repositories/testimoni.repo';

export const testimoniRoute = createAuthRouter();

testimoniRoute.openapi(getTestiByCourseIdRoute, async (c) => {
  const { courseId } = c.req.valid('param');
  const testi = await getTestiByCourseId(db, courseId);
  return c.json(testi, 200);
});

testimoniRoute.openapi(postTestimoniRoute, async (c) => {
  const data = c.req.valid('json');
  const res = await createTestimoni(db, data, c.var.user.id);
  return c.json(res, 200);
});

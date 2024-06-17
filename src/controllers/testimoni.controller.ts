import { db } from '~/db/drizzle';
import {
  postTestimoniRoute,
  getTestimoniByCourseIdRoute,
} from '~/routes/testimoni.route';
import { createAuthRouter } from './router-factory';
import {
  createTestimoni,
  getTestimoniByCourseId,
} from '~/repositories/testimoni.repo';

export const testimoniRoute = createAuthRouter();

testimoniRoute.openapi(postTestimoniRoute, async (c) => {
  const data = c.req.valid('json');
  const res = await createTestimoni(db, data, c.var.user.id);
  return c.json(res, 200);
});

testimoniRoute.openapi(getTestimoniByCourseIdRoute, async (c) => {
  const { courseId } = c.req.valid('param');
  const testi = await getTestimoniByCourseId(db, courseId);
  return c.json(testi, 200);
});

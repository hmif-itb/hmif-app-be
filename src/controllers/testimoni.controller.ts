import { db } from '~/db/drizzle';
import { roleMiddleware } from '~/middlewares/role.middleware';
import {
  createTestimoni,
  getTestimoniByCourseId,
} from '~/repositories/testimoni.repo';
import {
  getTestimoniByCourseIdRoute,
  postTestimoniRoute,
} from '~/routes/testimoni.route';
import { createAuthRouter } from './router-factory';

export const testimoniRoute = createAuthRouter();

testimoniRoute.post(
  postTestimoniRoute.getRoutingPath(),
  roleMiddleware(['akademik']),
);
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

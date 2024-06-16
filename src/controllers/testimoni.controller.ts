import { db } from '~/db/drizzle';
import { getTestimoniByCourseIdRoute } from '~/routes/testimoni.route';
import { createAuthRouter } from './router-factory';
import { getTestimoniByCourseId } from '~/repositories/testimoni.repo';

export const testimoniRoute = createAuthRouter();

testimoniRoute.openapi(getTestimoniByCourseIdRoute, async (c) => {
  const { courseId } = c.req.valid('param');
  const testi = await getTestimoniByCourseId(db, courseId);
  return c.json(testi, 200);
});

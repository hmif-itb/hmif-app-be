import { db } from '~/db/drizzle';
import { getTestiByCourseIdRoute } from '~/routes/testimoni.route';
import { createAuthRouter } from './router-factory';
import { getTestiByCourseId } from '~/repositories/testimoni.repo';

export const testiRoute = createAuthRouter();

testiRoute.openapi(getTestiByCourseIdRoute, async (c) => {
    const { courseId } = c.req.valid('param')
    const testi = await getTestiByCourseId(db, courseId);
    return c.json(
        testi,
        200,
    );
  });
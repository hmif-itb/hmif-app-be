import { listCourseRoute, listCourseRouteByID } from '~/routes/course.route';
import { createAuthRouter } from './router-factory';
import { getListCourses, getListCoursesById } from '~/repositories/course.repo';
import { db } from '~/db/drizzle';

export const courseRouter = createAuthRouter();

courseRouter.openapi(listCourseRoute, async (c) => {
  try {
    const courses = await getListCourses(db, c.req.valid('query'));
    return c.json(
      {
        courses,
      },
      200,
    );
  } catch (err) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      400,
    );
  }
});

courseRouter.openapi(listCourseRouteByID, async (c) => {
  try {
    const { courseId } = c.req.valid('param');
    const courses = await getListCoursesById(db, courseId);
    return c.json(
      {
        courses,
      },
      200,
    );
  } catch (err) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      400,
    );
  }
});

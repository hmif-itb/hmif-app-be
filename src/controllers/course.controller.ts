import {
  createCourseRoute,
  deleteCourseRoute,
  listCourseRoute,
  listCourseRouteByID,
  updateCourseRoute,
} from '~/routes/course.route';
import { createAuthRouter } from './router-factory';
import {
  createCourse,
  deleteCourse,
  getListCourses,
  getListCoursesById,
  updateCourse,
} from '~/repositories/course.repo';
import { db } from '~/db/drizzle';
import { PostgresError } from 'postgres';
import { CourseSchema } from '~/types/course.types';

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

courseRouter.openapi(createCourseRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const newCourse = CourseSchema.parse(await createCourse(db, data));
    return c.json(newCourse, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: 'Course has already been created' }, 400);
    return c.json(err, 400);
  }
});

courseRouter.openapi(updateCourseRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const { courseId } = c.req.valid('param');
    const course = CourseSchema.parse(await updateCourse(db, data, courseId));
    return c.json(course, 200);
  } catch (err) {
    return c.json(err, 400);
  }
});

courseRouter.openapi(deleteCourseRoute, async (c) => {
  try {
    const { courseId } = c.req.valid('param');
    const course = CourseSchema.parse(await deleteCourse(db, courseId));
    return c.json(course, 200);
  } catch (err) {
    return c.json(err, 400);
  }
});

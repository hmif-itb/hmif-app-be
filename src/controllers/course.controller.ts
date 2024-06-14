import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createCourse,
  createUserCourse,
  deleteCourse,
  deleteUserCourse,
  getCourseById,
  getListCourses,
  getUserCourse,
  updateCourse,
} from '~/repositories/course.repo';
import {
  createCourseRoute,
  createUserCourseRoute,
  deleteCourseRoute,
  deleteUserCourseRoute,
  getCourseByIdRoute,
  getCurrentUserCourseRoute,
  getUserCourseRoute,
  listCourseRoute,
  updateCourseRoute,
} from '~/routes/course.route';
import { CourseSchema } from '~/types/course.types';
import { createAuthRouter } from './router-factory';

export const courseRouter = createAuthRouter();

// User Course Controller

courseRouter.openapi(createUserCourseRoute, async (c) => {
  try {
    const userId = c.var.user.id;
    const data = c.req.valid('json');
    const newUserCourse = await createUserCourse(db, data, userId);
    return c.json(newUserCourse, 201);
  } catch (err) {
    if (err instanceof PostgresError) {
      if (err.code === '23503')
        return c.json({ error: 'Course not found' }, 404);
      return c.json({ error: 'Course has already been taken' }, 400);
    }
    throw err;
  }
});

courseRouter.openapi(getUserCourseRoute, async (c) => {
  const userId = c.var.user.id;
  const userCourses = await getUserCourse(db, userId);
  return c.json(userCourses, 200);
});

courseRouter.openapi(getCurrentUserCourseRoute, async (c) => {
  const userId = c.var.user.id;
  const userCourses = await getUserCourse(db, userId, true);
  return c.json(userCourses, 200);
});

courseRouter.openapi(deleteUserCourseRoute, async (c) => {
  try {
    const userId = c.var.user.id;
    const { courseId } = c.req.valid('param');
    const userCourse = await deleteUserCourse(db, userId, courseId);

    if (!userCourse) return c.json({ error: 'Course not found' }, 404);
    return c.json(userCourse, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ error: err.message }, 400);
    }
    return c.json({ error: 'Something went wrong' }, 500);
  }
});

// Course Controller

courseRouter.openapi(listCourseRoute, async (c) => {
  const courses = await getListCourses(db, c.req.valid('query'));
  return c.json(
    {
      courses,
    },
    200,
  );
});

courseRouter.openapi(getCourseByIdRoute, async (c) => {
  const { courseId } = c.req.valid('param');
  const course = await getCourseById(db, courseId);

  if (!course) return c.json({ error: 'Course not found' }, 404);
  return c.json(course, 200);
});

courseRouter.openapi(createCourseRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const newCourse = CourseSchema.parse(await createCourse(db, data));
    return c.json(newCourse, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: 'Course has already been created' }, 400);
    throw err;
  }
});

courseRouter.openapi(updateCourseRoute, async (c) => {
  const data = c.req.valid('json');
  const { courseId } = c.req.valid('param');
  const course = await updateCourse(db, data, courseId);

  if (!course) return c.json({ error: 'Course not found' }, 404);
  return c.json(course, 200);
});

courseRouter.openapi(deleteCourseRoute, async (c) => {
  const { courseId } = c.req.valid('param');
  const course = await deleteCourse(db, courseId);

  if (!course) return c.json({ error: 'Course not found' }, 404);
  return c.json(course, 200);
});

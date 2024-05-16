import {
  createCourseRoute,
  deleteCourseRoute,
  listCourseRoute,
  getCourseByIdRoute,
  updateCourseRoute,
  createUserCourseRoute,
  getUserCourseRoute,
} from '~/routes/course.route';
import { createAuthRouter } from './router-factory';
import {
  createCourse,
  deleteCourse,
  getListCourses,
  getCourseById,
  updateCourse,
  createUserCourse,
  getUserCourse,
} from '~/repositories/course.repo';
import { db } from '~/db/drizzle';
import { PostgresError } from 'postgres';
import { CourseSchema } from '~/types/course.types';

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
    return c.json(err, 400);
  }
});

courseRouter.openapi(getUserCourseRoute, async (c) => {
  try {
    const userId = c.var.user.id;
    const userCourses = await getUserCourse(db, userId);
    return c.json(userCourses, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ error: err.message }, 400);
    }
    return c.json({ error: 'Something went wrong' }, 500);
  }
});

// Course Controller

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

courseRouter.openapi(getCourseByIdRoute, async (c) => {
  try {
    const { courseId } = c.req.valid('param');
    const course = await getCourseById(db, courseId);

    if (!course) return c.json({ error: 'Course not found' }, 404);
    return c.json(course, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json(
        {
          error: err.message,
        },
        400,
      );
    } else {
      return c.json(
        {
          error: 'Something went wrong',
        },
        400,
      );
    }
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
    const course = await updateCourse(db, data, courseId);

    if (!course) return c.json({ error: 'Course not found' }, 404);
    return c.json(course, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json(
        {
          error: err.message,
        },
        400,
      );
    } else {
      return c.json(
        {
          error: 'Something went wrong',
        },
        400,
      );
    }
  }
});

courseRouter.openapi(deleteCourseRoute, async (c) => {
  try {
    const { courseId } = c.req.valid('param');
    const course = await deleteCourse(db, courseId);

    if (!course) return c.json({ error: 'Course not found' }, 404);
    return c.json(course, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json(
        {
          error: err.message,
        },
        400,
      );
    } else {
      return c.json(
        {
          error: 'Something went wrong',
        },
        400,
      );
    }
  }
});

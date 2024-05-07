import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { courses } from '~/db/schema';
import { ListCourseParamsSchema } from '~/types/course.types';

export async function getListCourses(
  db: Database,
  q: z.infer<typeof ListCourseParamsSchema>,
) {
  const curriculumYearQ = q.curriculumYear
    ? eq(courses.curriculumYear, Number(q.curriculumYear))
    : undefined;
  const majorQ = q.major ? eq(courses.major, q.major) : undefined;
  const semesterQ = q.semester
    ? eq(courses.semester, Number(q.semester))
    : undefined;

  const where = and(curriculumYearQ, majorQ, semesterQ);

  return await db.query.courses.findMany({
    where,
  });
}

export async function getListCoursesById(db: Database, courseId: string) {
  const courseIdQ = courseId ? eq(courses.id, courseId) : undefined;

  const where = and(courseIdQ);

  return await db.query.courses.findMany({
    where,
  });
}

import { InferInsertModel, and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { courses } from '~/db/schema';
import {
  ListCourseParamsSchema,
  UpdateCourseSchema,
} from '~/types/course.types';

export async function getListCourses(
  db: Database,
  q: z.infer<typeof ListCourseParamsSchema>,
) {
  const curriculumYearQ = q.curriculumYear
    ? eq(courses.curriculumYear, q.curriculumYear)
    : undefined;
  const majorQ = q.major ? eq(courses.major, q.major) : undefined;
  const semesterQ = q.semester ? eq(courses.semester, q.semester) : undefined;

  const where = and(curriculumYearQ, majorQ, semesterQ);

  return await db.query.courses.findMany({
    where,
  });
}

export async function getCourseById(db: Database, courseId: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  return course;
}

export async function createCourse(
  db: Database,
  data: InferInsertModel<typeof courses>,
) {
  return await db.transaction(async (tx) => {
    const newCourse = await tx
      .insert(courses)
      .values(data)
      .returning()
      .then(firstSure);
    return newCourse;
  });
}

export async function updateCourse(
  db: Database,
  data: z.infer<typeof UpdateCourseSchema>,
  courseId: string,
) {
  const course = await db
    .update(courses)
    .set(data)
    .where(eq(courses.id, courseId))
    .returning()
    .then(first);
  return course;
}

export async function deleteCourse(db: Database, courseId: string) {
  const course = await db
    .delete(courses)
    .where(eq(courses.id, courseId))
    .returning()
    .then(first);
  return course;
}

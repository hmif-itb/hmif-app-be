import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { courses } from '~/db/schema';
import {
  CreateCourseSchema,
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
  data: z.infer<typeof CreateCourseSchema>,
) {
  return await db.transaction(async (tx) => {
    const newCourse = await tx
      .insert(courses)
      .values({
        ...data,
        semesterCode: data.semester % 2 === 0 ? 'Genap' : 'Ganjil',
      })
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
    .set({
      ...data,
      semesterCode: data.semester
        ? data.semester % 2 === 0
          ? 'Genap'
          : 'Ganjil'
        : undefined,
    })
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

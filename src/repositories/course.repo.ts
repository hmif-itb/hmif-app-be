import { and, asc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { courses, userCourses } from '~/db/schema';
import {
  BatchCreateOrUpdateUserCourseSchema,
  CreateCourseSchema,
  CreateUserCourseSchema,
  ListCourseParamsSchema,
  UpdateCourseSchema,
} from '~/types/course.types';

// User Course Repository

export function getCurrentSemesterCodeAndYear() {
  // Get current time to determine semester code and year
  const timeNow = new Date();
  const currentMonth = timeNow.getMonth();
  const currentYear = timeNow.getFullYear();

  let semesterCodeTaken: 'Ganjil' | 'Genap', semesterYearTaken: number;
  if (currentMonth <= 5) {
    // If January - June, it's Genap semester of last year
    semesterCodeTaken = 'Genap';
    semesterYearTaken = currentYear - 1;
  } else {
    // If July - December, it's Ganjil semester of current year
    semesterCodeTaken = 'Ganjil';
    semesterYearTaken = currentYear;
  }

  return { semesterCodeTaken, semesterYearTaken };
}

export async function createUserCourse(
  db: Database,
  data: z.infer<typeof CreateUserCourseSchema>,
  userId: string,
) {
  const { semesterCodeTaken, semesterYearTaken } =
    getCurrentSemesterCodeAndYear();

  const userCourse = await db
    .insert(userCourses)
    .values({
      ...data,
      userId,
      semesterCodeTaken,
      semesterYearTaken,
    })
    .returning()
    .then(firstSure);

  return userCourse;
}

export async function batchCreateOrUpdateUserCourse(
  db: Database,
  data: z.infer<typeof BatchCreateOrUpdateUserCourseSchema>,
  userId: string,
) {
  if (!data.length) {
    return [];
  }
  const { semesterCodeTaken, semesterYearTaken } =
    getCurrentSemesterCodeAndYear();

  const newUserCourses = await db
    .insert(userCourses)
    .values(
      data.map((d) => ({
        ...d,
        userId,
        semesterCodeTaken,
        semesterYearTaken,
      })),
    )
    .onConflictDoUpdate({
      target: [userCourses.userId, userCourses.courseId],
      set: {
        class: sql`excluded.class`,
      },
    })
    .returning();
  return newUserCourses;
}

export async function getUserCourse(
  db: Database,
  userId: string,
  current: boolean = false, // Only gets user courses in this semester and year
) {
  const { semesterCodeTaken, semesterYearTaken } =
    getCurrentSemesterCodeAndYear();

  const where = and(
    eq(userCourses.userId, userId),
    current ? eq(userCourses.semesterCodeTaken, semesterCodeTaken) : undefined,
    current ? eq(userCourses.semesterYearTaken, semesterYearTaken) : undefined,
  );

  const userCourse = await db
    .select()
    .from(userCourses)
    .innerJoin(courses, eq(userCourses.courseId, courses.id))
    .where(where)
    .orderBy(
      asc(userCourses.semesterYearTaken),
      asc(userCourses.semesterCodeTaken),
      asc(courses.code),
    );
  return userCourse.map((uc) => ({
    ...uc.user_courses,
    course: {
      ...uc.courses,
    },
  }));
}

export async function deleteUserCourse(
  db: Database,
  userId: string,
  courseIds: string | string[],
) {
  const userCourseList = [];
  if (typeof courseIds === 'string') {
    courseIds = [courseIds];
  }
  for (const courseId of courseIds) {
    const userCourse = await db
      .delete(userCourses)
      .where(
        and(eq(userCourses.userId, userId), eq(userCourses.courseId, courseId)),
      )
      .returning()
      .then(first);
    if (userCourse) {
      userCourseList.push(userCourse);
    }
  }
  return userCourseList;
}

// Course Repository

export async function getListCourses(
  db: Database,
  q: z.infer<typeof ListCourseParamsSchema>,
) {
  const curriculumYearQ = q.curriculumYear
    ? eq(courses.curriculumYear, q.curriculumYear)
    : undefined;
  const majorQ = q.major ? eq(courses.major, q.major) : undefined;
  const semesterQ =
    q.semester !== undefined
      ? q.semester > 0
        ? eq(courses.semester, q.semester) // Kalo nilainya angka sem normal, ya query di semester itu aja
        : isNull(courses.semester) // Kalo nilianya 0, berarti bisa diambil di semua semester
      : undefined;
  const typeQ = q.type ? eq(courses.type, q.type) : undefined;
  const sksQ = q.credits ? eq(courses.credits, q.credits) : undefined;
  q.search = q.search?.trim();
  const searchQ = q.search
    ? or(
        ilike(
          courses.name,
          `%${q.search.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`,
        ),
        ilike(
          courses.code,
          `%${q.search.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`,
        ),
      )
    : undefined;

  const onlyActive = eq(courses.isActive, true); // Only fetch active courses, disallow fetch for unavailable (kur2019)

  const where = and(
    curriculumYearQ,
    majorQ,
    semesterQ,
    typeQ,
    sksQ,
    searchQ,
    onlyActive,
  );
  return await db.query.courses.findMany({
    where,
    orderBy: (c, { asc }) => [asc(c.code)],
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
        semesterCode: data.semester
          ? data.semester % 2 === 0
            ? 'Genap'
            : 'Ganjil'
          : null,
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

export async function getCourseUsersByIds(db: Database, courseIds: string[]) {
  if (!courseIds.length) {
    return [];
  }
  const current = getCurrentSemesterCodeAndYear();
  const courseUsers = await db.query.courses.findMany({
    where: inArray(courses.id, courseIds),
    with: {
      userCourses: {
        where: and(
          eq(userCourses.semesterCodeTaken, current.semesterCodeTaken),
          eq(userCourses.semesterYearTaken, current.semesterYearTaken),
        ),
      },
    },
  });
  return courseUsers;
}

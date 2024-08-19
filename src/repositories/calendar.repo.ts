import { and, eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { calendarEvent, calendarGroup, courses } from '~/db/schema';
import {
  GetCalendarEventParamsSchema,
  UpdateCalendarEventBodySchema,
  CalendarEvent,
  CalendarEventIdParamsSchema,
  PersonalCalendarParamSchema,
} from '~/types/calendar.types';
import { getUserAcademic } from './user-profile.repo';
import { JWTPayloadSchema } from '~/types/login.types';
import { getUserCourse } from './course.repo';

export async function getCalendarEvent(
  db: Database,
  q: z.infer<typeof GetCalendarEventParamsSchema>,
) {
  const { search, category, courseCode, year, major } = q;
  const isCoursesRequired = courseCode !== undefined || major !== undefined;
  const searchPhrase = search ? search.split(' ').join(' & ') : undefined;
  let calendarEvents = isCoursesRequired
    ? await getCalendarEventWithCoursesJoin(db, courseCode, major, searchPhrase)
    : await getCalendarEventOnly(db, searchPhrase);

  // courseCode and major filter are applied in the helper function
  // both helper functions return only list of CalendarEvents
  // see helper functions at the bottom of this code

  if (category) {
    calendarEvents = calendarEvents.filter((event) =>
      event.category.toLowerCase().includes(category.toLowerCase()),
    );
  }

  if (year) {
    calendarEvents = calendarEvents.filter(
      (event) => event.academicYear && event.academicYear === parseInt(year),
    );
  }

  return calendarEvents;
}

export async function getCalendarEventById(
  db: Database,
  { eventId }: z.infer<typeof CalendarEventIdParamsSchema>,
) {
  return await db.query.calendarEvent.findFirst({
    where: eq(calendarEvent.id, eventId),
    with: {
      calendarGroup: true,
    },
  });
}

export async function getCalendarGroupById(
  db: Database,
  calendarGroupId: string,
) {
  const calendarGroup = await db.query.calendarGroup.findFirst({
    where: eq(calendarEvent.id, calendarGroupId),
  });
  return calendarGroup;
}

export async function updateCalendarEvent(
  db: Database,
  data: z.infer<typeof UpdateCalendarEventBodySchema>,
  eventId: string,
) {
  const calendarEventId = await db
    .update(calendarEvent)
    .set(data)
    .where(eq(calendarEvent.id, eventId))
    .returning()
    .then(firstSure);
  return calendarEventId;
}

export async function deleteCalendarEvent(db: Database, eventId: string) {
  const calendarEventId = await db
    .delete(calendarEvent)
    .where(eq(calendarEvent.id, eventId))
    .returning()
    .then(first);
  return calendarEventId;
}

async function getCalendarEventOnly(db: Database, search?: string) {
  return await db
    .select()
    .from(calendarEvent)
    .where(
      search
        ? sql`to_tsvector('indonesian', ${calendarEvent.title}) @@ plainto_tsquery('indonesian', ${search})`
        : sql``,
    );
}
async function getCalendarEventWithCoursesJoin(
  db: Database,
  courseCode: string | undefined,
  major: 'IF' | 'STI' | 'OTHER' | undefined,
  search?: string,
) {
  let results = await db
    .select({
      calendarEvent,
      courseCode: courses.code,
      courseMajor: courses.major,
    })
    .from(calendarEvent)
    .where(
      search
        ? sql`to_tsvector('indonesian', ${calendarEvent.title}) @@ plainto_tsquery('indonesian', ${search})`
        : sql``,
    )
    .innerJoin(courses, eq(calendarEvent.courseId, courses.id));

  if (courseCode) {
    results = results.filter((r) => r.courseCode === courseCode);
  }

  if (major) {
    results = results.filter((r) => r.courseMajor === major);
  }

  const finalResults: Array<z.infer<typeof CalendarEvent>> = [];
  for (let i = 0; i < results.length; i++) {
    finalResults.push(results[i].calendarEvent);
  }
  return finalResults;
}

export async function createCalendarEvent(
  db: Database,
  data: typeof calendarEvent.$inferInsert,
) {
  const calendarEventId = await db
    .insert(calendarEvent)
    .values(data)
    .returning()
    .then(firstSure);
  return calendarEventId;
}

export async function getCalendarGroup(db: Database) {
  const calendarGroup = await db.query.calendarGroup.findMany();
  return calendarGroup;
}

export async function getPersonalCalendar(
  db: Database,
  user: z.infer<typeof JWTPayloadSchema>,
  query: z.infer<typeof PersonalCalendarParamSchema>,
) {
  const userAcademicContext = await getUserAcademic(db, user);
  const userCourseIds = (await getUserCourse(db, user.id, true)).map(
    (c) => c.courseId,
  );

  const academicEvents =
    userCourseIds.length > 0
      ? await db // Get academic events based on user context
          .select()
          .from(calendarEvent)
          .where(
            and(
              userCourseIds.length > 1
                ? or(...userCourseIds.map((c) => eq(calendarEvent.courseId, c)))
                : eq(calendarEvent.courseId, userCourseIds[0]),
              eq(
                calendarEvent.academicYear,
                userAcademicContext.semesterYearTaken,
              ),
            ),
          )
      : [];

  const himpunanCalendarId = // Dynamic query to get himpunan calendar group id
    (
      await db
        .select()
        .from(calendarGroup)
        .where(eq(calendarGroup.category, 'himpunan'))
    ).map((c) => c.id);

  const himpunanEvents =
    himpunanCalendarId.length > 0
      ? await db // Get himpunan events
          .select()
          .from(calendarEvent)
          .where(
            himpunanCalendarId.length > 0
              ? or(
                  ...himpunanCalendarId.map((id) =>
                    eq(calendarEvent.calendarGroupId, id),
                  ),
                )
              : eq(calendarEvent.calendarGroupId, himpunanCalendarId[0]),
          )
      : [];

  // console.log(academicEvents);
  // console.log(himpunanCalendarId);
  // console.log(himpunanEvents);

  const result = [...academicEvents, ...himpunanEvents].filter((c) => {
    const date = new Date(c.start);
    return (
      date.getMonth() + 1 === query.month && date.getFullYear() === query.year
    );
  });

  return result;
}

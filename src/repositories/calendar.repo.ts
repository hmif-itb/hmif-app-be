import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { calendarEvent, courses } from '~/db/schema';
import {
  GetCalendarEventParamsSchema,
  UpdateCalendarEventBodySchema,
  CalendarEvent,
  CalendarEventIdParamsSchema,
} from '~/types/calendar.types';

export async function getCalendarEvent(
  db: Database,
  q: z.infer<typeof GetCalendarEventParamsSchema>,
) {
  const { search, category, courseCode, year, major } = q;
  const isCoursesRequired = courseCode !== undefined || major !== undefined;
  let calendarEvents = isCoursesRequired
    ? await getCalendarEventWithCoursesJoin(db, courseCode, major)
    : await getCalendarEventOnly(db);

  // courseCode and major filter are applied in the helper function
  // both helper functions return only list of CalendarEvents
  // see helper functions at the bottom of this code

  if (search) {
    calendarEvents = calendarEvents.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase()),
    );
  }

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

async function getCalendarEventOnly(db: Database) {
  return await db.select().from(calendarEvent);
}
async function getCalendarEventWithCoursesJoin(
  db: Database,
  courseCode: string | undefined,
  major: 'IF' | 'STI' | 'OTHER' | undefined,
) {
  let results = await db
    .select({
      calendarEvent,
      courseCode: courses.code,
      courseMajor: courses.major,
    })
    .from(calendarEvent)
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

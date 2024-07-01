import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { calendarEvent } from '~/db/schema';
import { UpdateCalendarEventBodySchema } from '~/types/calendar.types';

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

export async function getCalendarEventById(db: Database, eventId: string) {
  const calendarEventId = await db.query.calendarEvent.findFirst({
    where: eq(calendarEvent.id, eventId),
    with: {
      calendarGroup: true,
    },
  });
  return calendarEventId;
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

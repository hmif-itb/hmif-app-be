import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { calendarEvent } from '~/db/schema';
import { UpdateCalendarEventBodySchema } from '~/types/calendar.types';

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
    .then(first);
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

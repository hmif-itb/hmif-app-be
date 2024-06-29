import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { calendarEvent } from '~/db/schema';

export async function deleteCalendarEvent(db: Database, eventId: string) {
  const calendarEventId = await db
    .delete(calendarEvent)
    .where(eq(calendarEvent.id, eventId))
    .returning()
    .then(first);
  return calendarEventId;
}

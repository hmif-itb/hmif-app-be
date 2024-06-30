import { GaxiosError } from 'gaxios';
import { calendar_v3, google } from 'googleapis';
import { env } from '~/configs/env.config';
import { googleAuth } from '~/lib/googleapi';
import {
  deleteCalendarEventRoute,
  getCalendarEventByIdRoute,
  getCalendarEventRoute,
  postCalendarEventRoute,
  updateCalendarEventRoute,
} from '~/routes/calendar.route';
import { createAuthRouter } from './router-factory';
import {
  deleteCalendarEvent,
  getCalendarEvent,
  getCalendarEventById,
  updateCalendarEvent,
} from '~/repositories/calendar.repo';
import { db } from '~/db/drizzle';
import { PostgresError } from 'postgres';

export const calendarRouter = createAuthRouter();

const START_OF_6_MONTHS_AGO = new Date();
START_OF_6_MONTHS_AGO.setMonth(START_OF_6_MONTHS_AGO.getMonth() - 6);

calendarRouter.openapi(postCalendarEventRoute, async (c) => {
  const { title, description, start, end } = c.req.valid('json');

  const event: calendar_v3.Schema$Event = {
    summary: title,
    description,
    start: {
      dateTime: start?.toISOString(),
      timeZone: 'Asia/Jakarta',
    },
    end: {
      dateTime: end?.toISOString(),
      timeZone: 'Asia/Jakarta',
    },
  };

  try {
    const response = await google.calendar('v3').events.insert({
      auth: googleAuth,
      calendarId: env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    return c.json(response.data, 201);
  } catch (error) {
    if (error instanceof GaxiosError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

calendarRouter.openapi(getCalendarEventRoute, async (c) => {
  const { search, category, courseCode, year, major } = c.req.valid('query');

  try {
    const data = await getCalendarEvent(db, {
      search,
      category,
      courseCode,
      year,
      major,
    });

    return c.json(data, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

calendarRouter.openapi(getCalendarEventByIdRoute, async (c) => {
  const { eventId } = c.req.valid('param');

  try {
    const data = await getCalendarEventById(db, { eventId });

    if (!data) return c.json("error: 'Event not found'", 404);
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

calendarRouter.openapi(updateCalendarEventRoute, async (c) => {
  const { eventId } = c.req.valid('param');
  const { title, description, start, end } = c.req.valid('json');

  let fetchedData: calendar_v3.Schema$Event;
  try {
    const response = await google.calendar('v3').events.get({
      auth: googleAuth,
      calendarId: env.GOOGLE_CALENDAR_ID,
      eventId,
    });
    fetchedData = response.data;

    const event = await updateCalendarEvent(
      db,
      {
        title,
        description,
        start,
        end,
      },
      eventId,
    );
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    return c.json(event, 200);
  } catch (error) {
    if (error instanceof GaxiosError && error.message === 'Not Found') {
      return c.json({ error: error.message }, 404);
    }
    throw error;
  }
});

calendarRouter.openapi(deleteCalendarEventRoute, async (c) => {
  try {
    const { eventId } = c.req.valid('param');
    await google.calendar('v3').events.delete({
      auth: googleAuth,
      calendarId: env.GOOGLE_CALENDAR_ID,
      eventId,
    });
    const event = await deleteCalendarEvent(db, eventId);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof GaxiosError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

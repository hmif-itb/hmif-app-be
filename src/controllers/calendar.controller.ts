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
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventById,
  getCalendarGroupById,
  updateCalendarEvent,
} from '~/repositories/calendar.repo';
import { db } from '~/db/drizzle';
import { calendarEvent } from '~/db/schema';

export const calendarRouter = createAuthRouter();

const START_OF_6_MONTHS_AGO = new Date();
START_OF_6_MONTHS_AGO.setMonth(START_OF_6_MONTHS_AGO.getMonth() - 6);

calendarRouter.openapi(postCalendarEventRoute, async (c) => {
  const {
    title,
    description,
    start,
    end,
    calendarGroupId,
    category,
    courseId,
    academicYear,
  } = c.req.valid('json');

  // 1. Check if calendar group exists
  const calendarGroup = await getCalendarGroupById(db, calendarGroupId);
  if (!calendarGroup?.googleCalendarUrl) {
    return c.json({ error: 'Calendar group not found' }, 404);
  }

  // 2. Create event in GCal
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
  let eventGCal: calendar_v3.Schema$Event;
  try {
    eventGCal = (
      await google.calendar('v3').events.insert({
        auth: googleAuth,
        calendarId: calendarGroup.googleCalendarUrl,
        requestBody: event,
      })
    ).data;
  } catch (error) {
    if (error instanceof GaxiosError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }

  if (!eventGCal.htmlLink || !eventGCal.id) {
    return c.json({ error: 'Failed to create event' }, 400);
  }

  // 3. Insert event to DB
  const insertData: typeof calendarEvent.$inferInsert = {
    calendarGroupId,
    courseId,
    title,
    description: description ?? '',
    category: category ?? '',
    academicYear,
    start,
    end,
    googleCalendarUrl: eventGCal.htmlLink,
    googleCalendarId: eventGCal.id,
  };
  const createdEvent = await createCalendarEvent(db, insertData);
  return c.json(createdEvent, 201);
});

calendarRouter.openapi(getCalendarEventRoute, async (c) => {
  const { search, startTime, endTime } = c.req.valid('query');

  try {
    const response = await google.calendar('v3').events.list({
      auth: googleAuth,
      eventTypes: ['default'],
      calendarId: env.GOOGLE_CALENDAR_ID,
      maxResults: 2500,

      q: search,
      timeMax: endTime?.toISOString(),
      timeMin: startTime?.toISOString() ?? START_OF_6_MONTHS_AGO.toISOString(),
    });

    console.log(response.data.items?.length);
    return c.json(response.data.items?.reverse() ?? [], 200);
  } catch (error) {
    if (error instanceof GaxiosError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

calendarRouter.openapi(getCalendarEventByIdRoute, async (c) => {
  const { eventId } = c.req.valid('param');

  try {
    const response = await google.calendar('v3').events.get({
      auth: googleAuth,
      calendarId: env.GOOGLE_CALENDAR_ID,
      eventId,
    });

    return c.json(response.data, 200);
  } catch (error) {
    if (error instanceof GaxiosError && error.message === 'Not Found') {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

calendarRouter.openapi(updateCalendarEventRoute, async (c) => {
  const { eventId } = c.req.valid('param');
  const { title, description, start, end } = c.req.valid('json');

  // 1. Fetch data from DB, if exists
  const eventDB = await getCalendarEventById(db, eventId);
  if (!eventDB) {
    return c.json({ error: 'Event not found' }, 404);
  }

  if (eventDB.calendarGroup.googleCalendarUrl === null) {
    // Buat type check aja kalo calendar group url exists
    return c.json(
      { error: "Event doesn't belong to any group, contact back-end!" },
      404,
    );
  }

  // 2. If exists, ambil id sama groupId dan get event from GCal
  let fetchedData: calendar_v3.Schema$Event;
  try {
    const response = await google.calendar('v3').events.get({
      auth: googleAuth,
      calendarId: eventDB.calendarGroup.googleCalendarUrl,
      eventId,
    });
    fetchedData = response.data;
  } catch (error) {
    if (error instanceof GaxiosError && error.message === 'Not Found') {
      return c.json({ error: error.message }, 404);
    }
    throw error;
  }

  // 3. Update ke GCal dulu make data baru (logic samain kyk kemarin)
  const event: calendar_v3.Schema$Event = {
    summary: title ?? fetchedData.summary,
    description: description ?? fetchedData.description,
    start: {
      dateTime: start?.toISOString() ?? fetchedData.start?.dateTime,
      timeZone: 'Asia/Jakarta',
    },
    end: {
      dateTime: end?.toISOString() ?? fetchedData.end?.dateTime,
      timeZone: 'Asia/Jakarta',
    },
  };

  try {
    await google.calendar('v3').events.update({
      auth: googleAuth,
      calendarId: env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: event,
    });
  } catch (error) {
    if (error instanceof GaxiosError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }

  // 4. Update ke DB
  const updatedEvent = await updateCalendarEvent(
    db,
    c.req.valid('json'),
    eventId,
  );
  return c.json(updatedEvent, 200);
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

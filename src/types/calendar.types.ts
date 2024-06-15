import { z } from '@hono/zod-openapi';

// Helpers
const optionalDateCoerce = z.preprocess((arg) => {
  if (typeof arg === 'string' || typeof arg === 'number') {
    const date = new Date(arg);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}, z.date().optional());

const addHours = (date: Date, hours: number) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

const EventDate = z.object({
  dateTime: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: new Date().toISOString() }),
  timeZone: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: 'Asia/Jakarta' }),
});

export const CalendarEvent = z
  .object({
    id: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: 'hlp70594b43hcn866d291i8jm0' }),
    created: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: new Date().toISOString() }),
    updated: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: new Date().toISOString() }),
    summary: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: 'Event title' }),
    description: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: 'Event description' }),
    start: EventDate.optional(),
    end: EventDate.optional(),
  })
  .openapi('CalendarEvent');

export const CalendarEventList = z.array(CalendarEvent);

export const CreateCalendarEventBodySchema = z.object({
  title: z.string().openapi({ example: 'Meeting' }),
  description: z.string().optional().openapi({ example: 'Meeting with team' }),
  start: z.coerce.date().openapi({ example: new Date().toISOString() }),
  end: z.coerce
    .date()
    .openapi({ example: addHours(new Date(), 2).toISOString() }),
});

export const GetCalendarEventParamsSchema = z.object({
  search: z.string().optional().openapi({ example: 'Meeting' }),
  startTime: optionalDateCoerce.openapi({ example: new Date().toISOString() }),
  endTime: optionalDateCoerce.openapi({
    example: addHours(new Date(), 24).toISOString(),
  }),
});

export const CalendarEventIdParamsSchema = z.object({
  eventId: z.string().openapi({ example: 'hlp70594b43hcn866d291i8jm0' }),
});

export const UpdateCalendarEventBodySchema = z.object({
  title: z.string().optional().openapi({ example: 'Meeting' }),
  description: z.string().optional().openapi({ example: 'Meeting with team' }),
  start: optionalDateCoerce.openapi({ example: new Date().toISOString() }),
  end: optionalDateCoerce.openapi({
    example: addHours(new Date(), 2).toISOString(),
  }),
});
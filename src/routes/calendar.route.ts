import { createRoute, z } from '@hono/zod-openapi';
import {
  CreateCalendarEventBodySchema,
  CalendarEventIdParamsSchema,
  GetCalendarEventParamsSchema,
  UpdateCalendarEventBodySchema,
  CalendarEvent,
  CalendarGroupSchema,
} from '~/types/calendar.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const postCalendarEventRoute = createRoute({
  operationId: 'postCalendarEvent',
  tags: ['calendar'],
  method: 'post',
  path: '/calendar',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateCalendarEventBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Event succesfully created',
      content: {
        'application/json': {
          schema: CalendarEvent,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

export const getCalendarEventRoute = createRoute({
  operationId: 'getCalendarEvent',
  tags: ['calendar'],
  method: 'get',
  path: '/calendar',
  request: {
    query: GetCalendarEventParamsSchema,
  },
  responses: {
    200: {
      description: 'Get list of calendar events',
      content: {
        'application/json': {
          schema: z.array(CalendarEvent),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

export const getCalendarEventByIdRoute = createRoute({
  operationId: 'getCalendarEventById',
  tags: ['calendar'],
  method: 'get',
  path: '/calendar/{eventId}',
  request: {
    params: CalendarEventIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Get calendar event by id',
      content: {
        'application/json': {
          schema: CalendarEvent,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
    404: {
      description: "Event doesn't exist",
      content: {
        'application/json': {
          schema: z.string(),
        },
      },
    },
  },
});

export const updateCalendarEventRoute = createRoute({
  operationId: 'updateCalendarEvent',
  tags: ['calendar'],
  method: 'put',
  path: '/calendar/{eventId}',
  request: {
    params: CalendarEventIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateCalendarEventBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Event succesfully updated',
      content: {
        'application/json': {
          schema: CalendarEvent,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

export const deleteCalendarEventRoute = createRoute({
  operationId: 'deleteCalendarEvent',
  tags: ['calendar'],
  method: 'delete',
  path: '/calendar/{eventId}',
  request: {
    params: CalendarEventIdParamsSchema,
  },
  responses: {
    204: {
      description: 'Event succesfully deleted',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

export const getCalendarGroupRoute = createRoute({
  operationId: 'getCalendarGroup',
  tags: ['calendar'],
  method: 'get',
  path: '/calendar-group',
  responses: {
    200: {
      description: 'Get list of calendar groups',
      content: {
        'application/json': {
          schema: z.array(CalendarGroupSchema),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

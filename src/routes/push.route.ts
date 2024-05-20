import { createRoute } from '@hono/zod-openapi';
import {
  PushBroadcastSchema,
  PushSubscriptionSchema,
} from '~/types/push.types';
import { validationErrorResponse } from '~/types/responses.type';

export const registerPushRoute = createRoute({
  operationId: 'registerPush',
  tags: ['push'],
  method: 'post',
  path: '/push/register',
  description: 'Register a push subscription returned by the browser push API',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PushSubscriptionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Push subscription registered',
    },
    400: validationErrorResponse,
  },
});

export const pushBroadcastRoute = createRoute({
  operationId: 'broadcast',
  tags: ['push'],
  method: 'post',
  path: '/push/broadcast',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PushBroadcastSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Push broadcasted',
    },
    400: validationErrorResponse,
  },
});

export const pushLogoutRoute = createRoute({
  operationId: 'logoutPush',
  tags: ['push'],
  method: 'put',
  path: '/push/logout',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PushSubscriptionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Push subscription logged out',
    },
    400: validationErrorResponse,
  },
});

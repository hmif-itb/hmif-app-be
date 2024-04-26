import { createRoute } from '@hono/zod-openapi';
import { validationErrorResponse } from '~/types/responses.type';

export const loginRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/login',
  request: {},
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {},
        },
      },
      description: 'login with google',
    },
    400: validationErrorResponse,
  },
});

export const authCallbackRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/auth/google/callback',
  request: {},
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {},
        },
      },
      description: 'callback google',
    },
    400: validationErrorResponse,
  },
});

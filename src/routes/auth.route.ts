import { createRoute } from '@hono/zod-openapi';
import {
  CallbackQueryParamsSchema,
  JWTPayloadSchema,
} from '~/types/login.types';
import {
  authorizaitonErrorResponse,
  errorResponse,
  validationErrorResponse,
} from '~/types/responses.type';

export const loginRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/login',
  request: {},
  responses: {
    302: {
      description: 'Redirect to Google login',
      headers: {
        location: {
          description: 'URL to Google login',
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
});

export const authCallbackRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/auth/google/callback',
  request: {
    query: CallbackQueryParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: JWTPayloadSchema,
        },
      },
      description: 'callback google',
    },
    400: validationErrorResponse,
    401: authorizaitonErrorResponse,
    500: errorResponse,
  },
});

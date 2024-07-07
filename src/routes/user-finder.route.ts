import { createRoute, z } from '@hono/zod-openapi';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';
import {
  ListUserSchema,
  NimFinderQuerySchema,
} from '~/types/user-finder.types';

export const getUserRoute = createRoute({
  operationId: 'getUser',
  tags: ['user-finder'],
  method: 'get',
  path: '/user/nim',
  request: {
    query: NimFinderQuerySchema,
  },
  responses: {
    200: {
      description: 'Get user By Nim or Full Name',
      content: {
        'application/json': {
          schema: ListUserSchema,
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
      description: 'User not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

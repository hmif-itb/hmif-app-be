import { createRoute, z } from '@hono/zod-openapi';
import {
  reactionQuerySchema,
  reactionResponseSchema,
} from '~/types/reaction.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getReactionsRoute = createRoute({
  operationId: 'getReactions',
  tags: ['reaction'],
  method: 'get',
  path: '/reaction',
  request: {
    query: reactionQuerySchema,
  },
  responses: {
    200: {
      description: 'Get reactions',
      content: {
        'application/json': {
          schema: reactionResponseSchema,
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
      description: 'Not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

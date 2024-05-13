import { createRoute, z } from '@hono/zod-openapi';
import {
  ReactionIdSchema,
  ReactionQuerySchema,
  ReactionResponseSchema,
  ReactionSchema,
} from '~/types/reaction.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getReactionsRoute = createRoute({
  operationId: 'getReactions',
  tags: ['reaction'],
  method: 'get',
  path: '/reaction',
  request: {
    query: ReactionQuerySchema,
  },
  responses: {
    200: {
      description: 'Get reactions',
      content: {
        'application/json': {
          schema: ReactionResponseSchema,
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

export const deleteReactionRoute = createRoute({
  operationId: 'deleteReaction',
  tags: ['reaction'],
  method: 'delete',
  path: '/reaction/{reactionId}',
  request: {
    params: ReactionIdSchema,
  },
  responses: {
    200: {
      description: 'Reaction deleted',
      content: {
        'application/json': {
          schema: ReactionSchema,
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

import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  ReactionSchema,
  ReactionIdSchema,
  ReactionQuerySchema,
  ReactionResponseSchema,
  CreateOrUpdateReactionSchema,
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

export const CreateOrUpdateReactionRoute = createRoute({
  operationId: 'CreateOrUpdateReaction',
  tags: ['reaction'],
  method: 'put',
  path: '/reaction',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateOrUpdateReactionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated reaction',
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
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
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
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
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

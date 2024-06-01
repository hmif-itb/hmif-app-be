import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  CommentIdSchema,
  CreateOrUpdateReactionParamsSchema,
  InfoIdSchema,
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

export const CreateOrUpdateReactionRoute = createRoute({
  operationId: 'CreateOrUpdateReaction',
  tags: ['reaction'],
  method: 'put',
  path: '/reaction',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateOrUpdateReactionParamsSchema,
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

export const deleteCommentReactionRoute = createRoute({
  operationId: 'deleteCommentReaction',
  tags: ['reaction'],
  method: 'delete',
  path: '/reaction/comment/{commentId}',
  request: {
    params: CommentIdSchema,
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

export const deleteInfoReactionRoute = createRoute({
  operationId: 'deleteInfoReaction',
  tags: ['reaction'],
  method: 'delete',
  path: '/reaction/info/{infoId}',
  request: {
    params: InfoIdSchema,
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

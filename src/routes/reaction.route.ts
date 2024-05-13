import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { ReactionSchema, UpdateReactionSchema } from '~/types/reaction.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const updateReactionRoute = createRoute({
  operationId: 'updateReaction',
  tags: ['reaction'],
  method: 'put',
  path: '/reaction/{reactionId}',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateReactionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated course',
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
      description: 'Course not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

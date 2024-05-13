import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { ReactionSchema, CreateOrUpdateReactionSchema } from '~/types/reaction.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

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

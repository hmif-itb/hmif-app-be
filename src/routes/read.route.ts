import { createRoute, z } from '@hono/zod-openapi';
import { CreateReadRequestBodySchema } from '~/types/read.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const postReadRoute = createRoute({
  operationId: 'postRead',
  tags: ['read'],
  method: 'post',
  path: '/read',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateReadRequestBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Created user read info',
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

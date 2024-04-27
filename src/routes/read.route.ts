import { createRoute } from '@hono/zod-openapi';
import { ReadSchema } from '~/types/read.types';
import { validationErrorResponse } from '~/types/responses.type';

export const postReadRoute = createRoute({
  operationId: 'postRead',
  tags: ['read'],
  method: 'post',
  path: '/read/{id}',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ReadSchema,
        },
      },
      description: 'Read info success',
    },
    400: validationErrorResponse,
  },
});

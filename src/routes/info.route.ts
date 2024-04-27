import { createRoute } from '@hono/zod-openapi';
import { validationErrorResponse } from '~/types/responses.type';
import { InfoParamSchema, InfoSchema } from '~/types/info.types';

export const createInfoRoute = createRoute({
  operationId: 'createInfo',
  tags: ['create-info'],
  method: 'post',
  path: '/info',
  description: 'Create an info',
  request: {
    body: {
      content: {
        'application/json': {
          schema: InfoParamSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: InfoSchema,
        },
      },
      description: 'Info created',
    },
    400: validationErrorResponse,
  },
});

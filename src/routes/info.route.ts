import { createRoute, z } from '@hono/zod-openapi';
import { CreateReadRequestBodySchema } from '~/types/info.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const postReadInfoRoute = createRoute({
  operationId: 'postInfoRead',
  tags: ['info'],
  method: 'post',
  path: '/info/{infoId}/read',
  request: {
    params: CreateReadRequestBodySchema,
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

import { createRoute, z } from '@hono/zod-openapi';
import {
  PostTestimoniBodySchema,
  TestimoniSchema,
} from '~/types/testimoni.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const postTestimoniRoute = createRoute({
  operationId: 'createTestimoni',
  tags: ['testimoni'],
  method: 'post',
  path: '/testimoni',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PostTestimoniBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Testimoni created',
      content: {
        'application/json': {
          schema: TestimoniSchema,
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
  },
});

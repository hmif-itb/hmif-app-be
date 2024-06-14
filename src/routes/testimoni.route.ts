import { createRoute, z } from '@hono/zod-openapi';
import {
  CourseIdParamsSchema,
  ListTestimoniSchema,
  PostTestimoniBodySchema,
  TestimoniSchema,
} from '~/types/testimoni.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getTestiByCourseIdRoute = createRoute({
  operationId: 'getTestiByCourseId',
  tags: ['testimoni'],
  method: 'get',
  path: '/testimoni/course/{courseId}',
  request: {
    params: CourseIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Get testimoni by course id',
      content: {
        'application/json': {
          schema: ListTestimoniSchema,
        },
      },
    },
  },
});

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

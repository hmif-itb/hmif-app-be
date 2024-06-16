import { createRoute, z } from '@hono/zod-openapi';
import {
  CourseIdParamsSchema,
  ListTestimoniSchema,
} from '~/types/testimoni.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getTestimoniByCourseIdRoute = createRoute({
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

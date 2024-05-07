import { createRoute, z } from '@hono/zod-openapi';
import {
  ListCourseParamsSchema,
  ListCourseSchema,
  CourseIdRequestBodySchema,
} from '~/types/course.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const listCourseRoute = createRoute({
  operationId: 'getlistCourses',
  tags: ['course'],
  method: 'get',
  path: '/course',
  request: {
    query: ListCourseParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListCourseSchema,
        },
      },
      description: 'Get list of courses',
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

export const listCourseRouteByID = createRoute({
  operationId: 'getlistCoursesById',
  tags: ['course'],
  method: 'get',
  path: '/course/{courseId}',
  request: {
    params: CourseIdRequestBodySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListCourseSchema,
        },
      },
      description: 'Get list of courses',
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

import { createRoute, z } from '@hono/zod-openapi';
import {
  ListCourseParamsSchema,
  ListCourseSchema,
  CourseIdRequestBodySchema,
  CourseSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateUserCourseSchema,
  UserCourseSchema,
  ListUserCourseSchema,
  BatchCreateOrUpdateUserCourseSchema,
  BatchCreateOrUpdateUserCourseResponseSchema,
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

export const getCourseByIdRoute = createRoute({
  operationId: 'getCourseById',
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
          schema: CourseSchema,
        },
      },
      description: 'Get list of courses',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorSchema,
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

export const createCourseRoute = createRoute({
  operationId: 'createCourse',
  tags: ['course'],
  method: 'post',
  path: '/course',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateCourseSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Created course',
      content: {
        'application/json': {
          schema: CourseSchema,
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

export const updateCourseRoute = createRoute({
  operationId: 'updateCourse',
  tags: ['course'],
  method: 'put',
  path: '/course/{courseId}',
  request: {
    params: CourseIdRequestBodySchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateCourseSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated course',
      content: {
        'application/json': {
          schema: CourseSchema,
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

export const deleteCourseRoute = createRoute({
  operationId: 'deleteCourse',
  tags: ['course'],
  method: 'delete',
  path: '/course/{courseId}',
  request: {
    params: CourseIdRequestBodySchema,
  },
  responses: {
    200: {
      description: 'Deleted course',
      content: {
        'application/json': {
          schema: CourseSchema,
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

// User Courses Routes

export const createUserCourseRoute = createRoute({
  operationId: 'createUserCourse',
  tags: ['course'],
  method: 'post',
  path: '/course/take',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserCourseSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Course added to user courses',
      content: {
        'application/json': {
          schema: UserCourseSchema,
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

export const getUserCourseRoute = createRoute({
  operationId: 'getUserCourse',
  tags: ['course'],
  method: 'get',
  path: '/course/take',
  responses: {
    200: {
      description: 'Get user courses',
      content: {
        'application/json': {
          schema: ListUserCourseSchema,
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

export const getCurrentUserCourseRoute = createRoute({
  operationId: 'getCurrentUserCourse',
  tags: ['course'],
  method: 'get',
  path: '/course/take/current',
  responses: {
    200: {
      description: 'Get user current course',
      content: {
        'application/json': {
          schema: ListUserCourseSchema,
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

export const deleteUserCourseRoute = createRoute({
  operationId: 'deleteUserCourse',
  tags: ['course'],
  method: 'delete',
  path: '/course/take/{courseId}',
  request: {
    params: CourseIdRequestBodySchema,
  },
  responses: {
    200: {
      description: 'Deleted user course',
      content: {
        'application/json': {
          schema: UserCourseSchema,
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
      description: 'User course not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const createOrUpdateBatchUserCourseRoute = createRoute({
  operationId: 'createOrUpdateBatchUserCourse',
  tags: ['course'],
  method: 'put',
  path: '/course/take/batch',
  request: {
    body: {
      content: {
        'application/json': {
          schema: BatchCreateOrUpdateUserCourseSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Courses added to user courses',
      content: {
        'application/json': {
          schema: BatchCreateOrUpdateUserCourseResponseSchema,
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

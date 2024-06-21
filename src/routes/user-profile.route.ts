import { UserAcademicSchema, UserSchema } from '~/types/user.types';
import { createRoute, z } from '@hono/zod-openapi';
import { ValidationErrorSchema, ErrorSchema } from '~/types/responses.type';

export const getUserAcademicRoute = createRoute({
  operationId: 'getUserAcademic',
  tags: ['user_profile'],
  method: 'get',
  path: '/user/academic',
  request: {},
  responses: {
    200: {
      description: 'Get academic info of user',
      content: {
        'application/json': {
          schema: UserAcademicSchema,
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

export const getUserProfileRoute = createRoute({
  operationId: 'getUserProfile',
  tags: ['user_profile'],
  method: 'get',
  path: '/user',
  request: {},
  responses: {
    200: {
      description: 'Get profile of user',
      content: {
        'application/json': {
          schema: UserSchema,
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

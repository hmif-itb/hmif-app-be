import { createRoute, z } from '@hono/zod-openapi';
import {
  CreateReadRequestBodySchema,
  InfoParamSchema,
  InfoSchema,
} from '~/types/info.types';
import {
  ErrorSchema,
  validationErrorResponse,
  ValidationErrorSchema,
} from '~/types/responses.type';

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

export const createInfoRoute = createRoute({
  operationId: 'createInfo',
  tags: ['info'],
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

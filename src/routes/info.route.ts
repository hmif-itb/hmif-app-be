import { createRoute, z } from '@hono/zod-openapi';
import {
  CreateInfoBodySchema,
  CreateReadRequestBodySchema,
  InfoIdParamsSchema,
  InfoSchema,
  ListInfoParamsSchema,
  ListInfoSchema,
} from '~/types/info.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const postReadInfoRoute = createRoute({
  operationId: 'readInfo',
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
          schema: CreateInfoBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Info created',
      content: {
        'application/json': {
          schema: InfoSchema,
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

export const listInfoRoute = createRoute({
  operationId: 'getListInfos',
  tags: ['info'],
  method: 'get',
  path: '/info',
  request: {
    query: ListInfoParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListInfoSchema,
        },
      },
      description: 'Get list of infos based on filter',
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

export const deleteInfoRoute = createRoute({
  operationId: 'deleteInfo',
  tags: ['info'],
  method: 'delete',
  path: '/info/{infoId}',
  request: {
    params: InfoIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Info deleted',
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

import { createRoute, z } from '@hono/zod-openapi';
import { ListAngkatanSchema } from '~/types/angkatan.types';
import { ListCategorySchema } from '~/types/category.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getListCategoryRoute = createRoute({
  operationId: 'getListCategory',
  tags: ['category'],
  method: 'get',
  path: '/category',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListCategorySchema,
        },
      },
      description: 'Get list of categories',
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

export const getInfoListCategoryRoute = createRoute({
  operationId: 'getInfoListCategory',
  tags: ['category'],
  method: 'get',
  path: '/category/info',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListCategorySchema,
        },
      },
      description: 'Get list of categories',
    },
  },
});

export const getListAngkatanRoute = createRoute({
  operationId: 'getListAngkatan',
  tags: ['category'],
  method: 'get',
  path: '/angkatan',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListAngkatanSchema,
        },
      },
      description: 'Get list of angkatan',
    },
  },
});

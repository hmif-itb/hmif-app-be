import { createRoute, z } from '@hono/zod-openapi';
import {
  CategoryParamSchema,
  CategorySchema,
  ListCategorySchema,
} from '~/types/category.types';
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

export const getCategoryByIdRoute = createRoute({
  operationId: 'getCategoryById',
  tags: ['category'],
  method: 'get',
  path: '/category/{id}',
  request: {
    params: CategoryParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CategorySchema,
        },
      },
      description: 'Get category by id',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
    404: {
      description: 'Category not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

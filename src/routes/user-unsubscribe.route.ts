import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import {
  ValidationErrorSchema,
  ErrorSchema,
  ServerErrorSchema,
} from '~/types/responses.type';
import {
  DeleteListUserUnsubscribeCategorySchema,
  DeleteUserUnsubscribeCategoryParamsSchema,
  DeleteUserUnsubscribeCategorySchema,
  GetListUserUnsubscribeCategorySchema,
  GetUserUnsubscribeCategoryParamsSchema,
  GetUserUnsubscribeCategoryResponseSchema,
  GetUserUnsubscribeCategorySchema,
  PostListUserUnsubscribeCategoryParamsSchema,
  PostListUserUnsubscribeCategoryResponseSchema,
  PostListUserUnsubscribeCategorySchema,
  PostUserUnsubscribeCategoryParamsSchema,
  PostUserUnsubscribeCategorySchema,
} from '~/types/user-unsubscribe.types';

export const getUserUnsubscribeCategoryRoute = createRoute({
  operationId: 'getUserUnsubscribeCategory',
  tags: ['unsubscribe'],
  method: 'get',
  path: '/unsubscribe/category/{categoryId}',
  description: 'Get a specific category which user is unsubscribed to',
  request: {
    params: GetUserUnsubscribeCategoryParamsSchema,
  },
  responses: {
    200: {
      description: 'Selected a category which user unsubscribed to',
      content: {
        'application/json': {
          schema: GetUserUnsubscribeCategoryResponseSchema,
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
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ServerErrorSchema,
        },
      },
    },
  },
});

export const getListUserUnsubscribeCategoryRoute = createRoute({
  operationId: 'getListUserUnsubscribeCategory',
  tags: ['unsubscribe'],
  method: 'get',
  path: '/unsubscribe/categories',
  description: 'Get list of categories which user unsubscribes to',
  responses: {
    200: {
      description: 'Selected multiple categories which user unsubscribed to',
      content: {
        'application/json': {
          schema: GetListUserUnsubscribeCategorySchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ServerErrorSchema,
        },
      },
    },
  },
});

export const postUserUnsubscribeCategoryRoute = createRoute({
  operationId: 'postUserUnsubscribeCategory',
  tags: ['unsubscribe'],
  method: 'post',
  path: '/unsubscribe/category',
  description: 'Unsubscribe a user from a category',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PostUserUnsubscribeCategoryParamsSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Unsubscribed user to the category',
      content: {
        'application/json': {
          schema: PostUserUnsubscribeCategorySchema,
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
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ServerErrorSchema,
        },
      },
    },
  },
});

export const postListUserUnsubscribeCategoryRoute = createRoute({
  operationId: 'postListUserUnsubscribeCategory',
  tags: ['unsubscribe'],
  method: 'post',
  path: '/unsubscribe/categories',
  description: 'Unsubscribe a user from multiple categories',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PostListUserUnsubscribeCategoryParamsSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'User unsubscribed to all given categories',
      content: {
        'application/json': {
          schema: PostListUserUnsubscribeCategoryResponseSchema,
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
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ServerErrorSchema,
        },
      },
    },
  },
});

export const deleteUserUnsubscribeCategoryRoute = createRoute({
  operationId: 'deleteUserUnsubscribeCategory',
  tags: ['unsubscribe'],
  method: 'delete',
  path: '/unsubscribe/category',
  description: 'Remove user unsubscription from a category',
  request: {
    body: {
      content: {
        'application/json': {
          schema: DeleteUserUnsubscribeCategoryParamsSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Subscribed user to the category',
      content: {
        'application/json': {
          schema: DeleteUserUnsubscribeCategorySchema,
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
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ServerErrorSchema,
        },
      },
    },
  },
});

export const deleteListUserUnsubscribeRoute = createRoute({
  operationId: 'deleteListUserUnsubscribe',
  tags: ['unsubscribe'],
  method: 'delete',
  path: '/unsubscribe/categories',
  description: 'Remove user unsubscription from multiple categories',
  request: {
    body: {
      content: {
        'application/json': {
          schema: DeleteUserUnsubscribeCategoryParamsSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'User is subscribed to all given categories',
      content: {
        'application/json': {
          schema: DeleteListUserUnsubscribeCategorySchema,
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
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ServerErrorSchema,
        },
      },
    },
  },
});

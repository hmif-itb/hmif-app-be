import { createRoute, z } from '@hono/zod-openapi';
import {
  CommentListQuerySchema,
  CommentListSchema,
  CommentIdQuerySchema,
  CommentSchema,
  CommentContentSchema,
} from '~/types/comment.types';
import {
  ErrorSchema,
  validationErrorResponse,
  ValidationErrorSchema,
} from '~/types/responses.type';

export const getCommentsListRoute = createRoute({
  operationId: 'getCommentsList',
  tags: ['comment'],
  method: 'get',
  path: '/comments',
  request: {
    query: CommentListQuerySchema,
  },
  responses: {
    200: {
      description: 'Fetched list of comments',
      content: {
        'application/json': {
          schema: CommentListSchema,
        },
      },
    },
    400: validationErrorResponse,
  },
});

export const getCommentsbyIdRoute = createRoute({
  operationId: 'getCommentsById',
  tags: ['comment'],
  method: 'get',
  path: '/comment/{commentId}',
  request: {
    params: CommentIdQuerySchema,
  },
  responses: {
    200: {
      description: 'Fetched comment by id',
      content: {
        'application/json': {
          schema: CommentSchema,
        },
      },
    },
    400: validationErrorResponse,
    404: {
      description: 'Comment not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const updateCommentContentRoute = createRoute({
  operationId: 'updateCommentContent',
  tags: ['comment'],
  method: 'put',
  path: '/comment/{commentId}',
  request: {
    params: CommentIdQuerySchema,
    body: {
      content: {
        'application/json': {
          schema: CommentContentSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Updated comment content',
      content: {
        'application/json': {
          schema: CommentSchema,
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
      description: 'Comment not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

import { createRoute } from '@hono/zod-openapi';
import {
  CommentListQuerySchema,
  CommentListSchema,
  CommentIdQuerySchema,
  CommentSchema,
  postCommentBody,
  deleteCommentParam,
} from '~/types/comment.types';
import { ErrorSchema, validationErrorResponse } from '~/types/responses.type';

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

export const postCommentRoute = createRoute({
  operationId: 'postComment',
  tags: ['comments'],
  method: 'post',
  path: '/comment',
  description: 'post a comment',
  request: {
    body: {
      content: {
        'application/json': {
          schema: postCommentBody,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'comment posted succesfuly',
    },
    400: validationErrorResponse,
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const deleteCommentRoute = createRoute({
  operationId: 'readInfo',
  tags: ['comments'],
  method: 'delete',
  path: '/comment/{commentId}',
  request: {
    params: deleteCommentParam,
  },
  responses: {
    200: {
      description: 'successfully deleted comment',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

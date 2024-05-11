import { createRoute } from '@hono/zod-openapi';
import {
  CommentListQuerySchema,
  CommentListSchema,
  CommentIdQuerySchema,
  CommentSchema,
} from '~/types/comment.types';
import { validationErrorResponse } from '~/types/responses.type';

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
  },
});

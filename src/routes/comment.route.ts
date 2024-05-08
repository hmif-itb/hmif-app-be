import { createRoute } from '@hono/zod-openapi';
import {
  CommentListQuerySchema,
  CommentListSchema,
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

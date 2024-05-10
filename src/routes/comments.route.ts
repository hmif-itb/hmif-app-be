import { createRoute, z } from '@hono/zod-openapi';
import { postCommentBody } from '~/types/comments.types';
import { validationErrorResponse} from '~/types/responses.type';

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
  },
});
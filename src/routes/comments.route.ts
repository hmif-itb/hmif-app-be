import { createRoute, z } from '@hono/zod-openapi';
import { deleteCommentParam, postCommentBody } from '~/types/comments.types';
import { validationErrorResponse, ValidationErrorSchema, ErrorSchema} from '~/types/responses.type';

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
            schema: z.union([ValidationErrorSchema, ErrorSchema]),
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
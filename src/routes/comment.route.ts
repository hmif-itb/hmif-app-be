import { createRoute, z } from '@hono/zod-openapi';
import {
  CommentIdParamSchema,
  CommentListQuerySchema,
  CommentListSchema,
  CommentPostBodySchema,
  CommentSchema,
  CommentUpdateBodySchema,
} from '~/types/comment.types';
import {
  ErrorSchema,
  ValidationErrorSchema,
  validationErrorResponse,
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

export const getCommentsByIdRoute = createRoute({
  operationId: 'getCommentsById',
  tags: ['comment'],
  method: 'get',
  path: '/comment/{commentId}',
  request: {
    params: CommentIdParamSchema,
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
    params: CommentIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: CommentUpdateBodySchema,
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

export const postCommentRoute = createRoute({
  operationId: 'postComment',
  tags: ['comment'],
  method: 'post',
  path: '/comment',
  description: 'post a comment',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CommentPostBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Comment posted succesfuly',
      content: {
        'application/json': {
          schema: CommentSchema,
        },
      },
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
  operationId: 'deleteComment',
  tags: ['comment'],
  method: 'delete',
  path: '/comment/{commentId}',
  request: {
    params: CommentIdParamSchema,
  },
  responses: {
    200: {
      description: 'Successfully deleted comment',
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

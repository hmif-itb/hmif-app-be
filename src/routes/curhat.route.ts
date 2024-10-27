import { createRoute, z } from '@hono/zod-openapi';
import {
  ChatroomIdParamsSchema,
  ChatroomLabelSchema,
  ChatroomSchema,
  CreateLabelChatroomBodySchema,
  ListChatroomSchema,
  PinChatroomBodySchema,
  PutLabelChatroomSchema,
} from '~/types/curhat.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getUserChatroomsRoute = createRoute({
  operationId: 'getUserChatrooms',
  tags: ['curhat'],
  method: 'get',
  path: '/curhat/chatrooms',
  description: 'Get user chatrooms',
  responses: {
    200: {
      description: 'Get user chatrooms',
      content: {
        'application/json': {
          schema: ListChatroomSchema,
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
  },
});

export const createChatroomRoute = createRoute({
  operationId: 'createChatroom',
  tags: ['curhat'],
  method: 'post',
  path: '/curhat/chatroom',
  description: 'Create new chatroom',
  request: {},
  responses: {
    201: {
      description: 'Chatroom created',
      content: {
        'application/json': {
          schema: ChatroomSchema,
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
  },
});

export const deleteChatroomRoute = createRoute({
  operationId: 'deleteChatroom',
  tags: ['curhat'],
  method: 'delete',
  path: '/curhat/chatroom/{chatroomId}',
  request: {
    params: ChatroomIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Chatroom deleted',
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
      description: 'Id not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const putLabelChatroomRoute = createRoute({
  operationId: 'putLabelChatroom',
  tags: ['curhat'],
  method: 'put',
  path: '/curhat/chatroom/{chatroomId}/label',
  description: 'Update chatroom labels',
  request: {
    params: ChatroomIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: PutLabelChatroomSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Chatroom labels updated',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
  },
});

export const createLabelChatroomRoute = createRoute({
  operationId: 'createLabelChatroom',
  tags: ['curhat'],
  method: 'post',
  path: '/curhat/label',
  description: 'Create new chatroom label',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateLabelChatroomBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Chatroom label created',
      content: {
        'application/json': {
          schema: ChatroomLabelSchema,
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
  },
});

export const pinChatroomRoute = createRoute({
  operationId: 'pinChatroom',
  tags: ['curhat'],
  method: 'put',
  path: '/curhat/chatroom/{chatroomId}/pin',
  description: 'Pin/unpin chatroom',
  request: {
    params: ChatroomIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: PinChatroomBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Pin/unpin success',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
  },
});

export const readChatroomMessages = createRoute({
  operationId: 'readChatroomMessages',
  tags: ['curhat'],
  method: 'post',
  path: '/curhat/chatroom/{chatroomId}/read',
  description: 'Read all chatroom messages',
  request: {
    params: ChatroomIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Read chatroom messages success',
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
  },
});

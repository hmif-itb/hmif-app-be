import { createRoute } from '@hono/zod-openapi';
import {
  CallbackQueryParamsSchema,
  JWTPayloadSchema,
  LoginAccessTokenSchema,
  LoginBypassParamSchema,
  UserResponseSchema,
} from '~/types/login.types';
import {
  authorizaitonErrorResponse,
  errorResponse,
  validationErrorResponse,
} from '~/types/responses.type';
import { UserGroupsSchema } from '~/types/user.types';

export const loginRoute = createRoute({
  operationId: 'loginWeb',
  tags: ['auth'],
  method: 'get',
  path: '/login',
  request: {},
  responses: {
    302: {
      description: 'Redirect to Google login',
      headers: {
        location: {
          description: 'URL to Google login',
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
});

export const loginAccessTokenRoute = createRoute({
  operationId: 'loginAccessToken',
  tags: ['auth'],
  method: 'post',
  path: '/auth/login/accesstoken',
  description: 'Login with access token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginAccessTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: JWTPayloadSchema,
          example: {
            id: 'hijtlb2yuy8dsssyy6cgo1fv',
            nim: '18221000',
            email: '18221000@std.stei.itb.ac.id',
            full_name: 'Dr. Asep Spakbor',
            jurusan: 'STI',
            asal_kampus: 'Ganesha',
            angkatan: 2021,
            jenis_kelamin: 'Laki-laki',
            status_keanggotaan: 'Anggota Biasa',
            picture: 'https://example.com/picture.jpg',
          },
        },
      },
      description: 'Login succesful',
    },
    400: validationErrorResponse,
    401: authorizaitonErrorResponse,
  },
});

export const authCallbackRoute = createRoute({
  operationId: 'loginCallback',
  tags: ['auth'],
  method: 'get',
  path: '/auth/google/callback',
  request: {
    query: CallbackQueryParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: JWTPayloadSchema,
          example: {
            id: 'hijtlb2yuy8dsssyy6cgo1fv',
            nim: '18221000',
            email: '18221000@std.stei.itb.ac.id',
            full_name: 'Dr. Asep Spakbor',
            jurusan: 'STI',
            asal_kampus: 'Ganesha',
            angkatan: 2021,
            jenis_kelamin: 'M',
            status_keanggotaan: 'Anggota Biasa',
            picture: 'https://example.com/picture.jpg',
          },
        },
      },
      description: 'Login succesful',
    },
    400: validationErrorResponse,
    401: authorizaitonErrorResponse,
    500: errorResponse,
  },
});

export const logoutRoute = createRoute({
  operationId: 'logout',
  tags: ['auth'],
  method: 'post',
  path: '/logout',
  responses: {
    200: {
      description: 'Logout successful',
    },
    401: authorizaitonErrorResponse,
    500: errorResponse,
  },
});

export const selfRoute = createRoute({
  operationId: 'getMe',
  tags: ['auth'],
  method: 'get',
  path: '/me',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
          example: {
            id: 'hijtlb2yuy8dsssyy6cgo1fv',
            nim: '18221000',
            email: '18221000@std.stei.itb.ac.id',
            full_name: 'Dr. Asep Spakbor',
            jurusan: 'Sistem dan Teknologi Informasi',
            asal_kampus: 'Ganesha',
            angkatan: 2021,
            jenis_kelamin: 'M',
            status_keanggotaan: 'Anggota Biasa',
            picture: 'https://example.com/picture.jpg',
            roles: ['akademik'],
          },
        },
      },
      description: 'Login succesful',
    },
    401: authorizaitonErrorResponse,
    500: errorResponse,
  },
});

export const loginBypassRoute = createRoute({
  operationId: 'loginBypass',
  tags: ['auth'],
  method: 'get',
  path: '/auth/login/bypass/{token}',
  request: {
    params: LoginBypassParamSchema,
  },
  responses: {
    200: {
      description: 'Login bypass successful',
      content: {
        'application/json': {
          schema: JWTPayloadSchema,
        },
      },
    },
    400: errorResponse,
  },
});

export const getUserGroupsRoute = createRoute({
  operationId: 'getUserGroups',
  tags: ['auth'],
  method: 'get',
  path: '/auth/groups',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserGroupsSchema,
        },
      },
      description: 'Get user groups',
    },
  },
});

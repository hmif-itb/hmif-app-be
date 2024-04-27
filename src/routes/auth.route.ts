import { createRoute } from '@hono/zod-openapi';
import {
  CallbackQueryParamsSchema,
  JWTPayloadSchema,
} from '~/types/login.types';
import {
  authorizaitonErrorResponse,
  errorResponse,
  validationErrorResponse,
} from '~/types/responses.type';

export const loginRoute = createRoute({
  operationId: 'loginRoute',
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

export const authCallbackRoute = createRoute({
  operationId: 'loginRoute',
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
            jurusan: 'Sistem dan Teknologi Informasi',
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
    500: errorResponse,
  },
});

export const logoutRoute = createRoute({
  operationId: 'logoutRoute',
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
  operationId: 'selfRoute',
  tags: ['auth'],
  method: 'get',
  path: '/me',
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
            jurusan: 'Sistem dan Teknologi Informasi',
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
    401: authorizaitonErrorResponse,
    500: errorResponse,
  },
});

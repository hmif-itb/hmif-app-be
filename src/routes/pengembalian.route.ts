import { createRoute, z } from '@hono/zod-openapi';
import {
  PeminjamanAktifSchema,
  PeminjamanIdParamSchema,
  SubmitPengembalianBodySchema,
} from '~/types/pengembalian.types';
import {
  ErrorSchema,
  ValidationErrorSchema,
  errorResponse,
} from '~/types/responses.type';

export const getPeminjamanAktifRoute = createRoute({
  operationId: 'getPeminjamanAktif',
  tags: ['pengembalian'],
  method: 'get',
  path: '/pengembalian/saya',
  responses: {
    200: {
      description: 'Daftar peminjaman aktif milik pengguna',
      content: {
        'application/json': { schema: z.array(PeminjamanAktifSchema) },
      },
    },
    403: errorResponse,
  },
});

export const submitPengembalianRoute = createRoute({
  operationId: 'submitPengembalian',
  tags: ['pengembalian'],
  method: 'put',
  path: '/pengembalian/{peminjamanId}',
  request: {
    params: PeminjamanIdParamSchema,
    body: {
      content: { 'application/json': { schema: SubmitPengembalianBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Pengembalian berhasil disubmit, menunggu verifikasi admin',
      content: { 'application/json': { schema: PeminjamanAktifSchema } },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
    403: errorResponse,
    404: errorResponse,
  },
});

import { createRoute, z } from '@hono/zod-openapi';
import {
  GetWargaPropertiParamsSchema,
  WargaPropertiSchema,
  CreatePengajuanBodySchema,
  PengajuanResponseSchema,
} from '~/types/pengajuan.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const getWargaPropertiListRoute = createRoute({
  operationId: 'getWargaPropertiList',
  tags: ['pengajuan-peminjaman'],
  method: 'get',
  path: '/warga/properti',
  request: {
    query: GetWargaPropertiParamsSchema,
  },
  responses: {
    200: {
      description: 'Daftar properti yang tersedia untuk dipinjam',
      content: { 'application/json': { schema: z.array(WargaPropertiSchema) } },
    },
  },
});

export const createPengajuanRoute = createRoute({
  operationId: 'createPengajuan',
  tags: ['pengajuan-peminjaman'],
  method: 'post',
  path: '/peminjaman',
  request: {
    body: {
      content: { 'application/json': { schema: CreatePengajuanBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Pengajuan peminjaman berhasil dibuat',
      content: { 'application/json': { schema: PengajuanResponseSchema } },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
    409: {
      description: 'Konflik jadwal (untuk peminjaman eksklusif)',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

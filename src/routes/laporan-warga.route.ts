import { createRoute, z } from '@hono/zod-openapi';
import {
  CreateLaporanBodySchema,
  LaporanWargaResponseSchema,
} from '~/types/laporan-warga.types';
import {
  ErrorSchema,
  ValidationErrorSchema,
  errorResponse,
} from '~/types/responses.type';

export const createLaporanRoute = createRoute({
  operationId: 'createLaporanWarga',
  tags: ['laporan-warga'],
  method: 'post',
  path: '/laporan/warga',
  request: {
    body: {
      content: { 'application/json': { schema: CreateLaporanBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Laporan berhasil dibuat',
      content: { 'application/json': { schema: LaporanWargaResponseSchema } },
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

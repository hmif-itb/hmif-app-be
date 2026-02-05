import { createRoute, z } from '@hono/zod-openapi';
import {
  GetRequestParamsSchema,
  GetLaporanParamsSchema,
  PeminjamanRequestSchema,
  LaporanSchema,
  PeminjamanIdParamSchema,
  LaporanIdParamSchema,
  UpdatePeminjamanStatusSchema,
  UpdateLaporanStatusSchema,
  PeminjamanScheduleResponseSchema,
  PaginatedPeminjamanRequestSchema,
  PaginatedLaporanSchema,
} from '~/types/request-laporan.types';
import { PropertiIdParamSchema } from '~/types/properti.types';
import { errorResponse } from '~/types/responses.type';

export const getRequestListRoute = createRoute({
  operationId: 'getRequestList',
  tags: ['manajemen-request-laporan'],
  method: 'get',
  path: '/request',
  request: {
    query: GetRequestParamsSchema,
  },
  responses: {
    200: {
      description: 'Daftar request peminjaman',
      content: {
        'application/json': { schema: PaginatedPeminjamanRequestSchema },
      },
    },
  },
});

export const updateRequestStatusRoute = createRoute({
  operationId: 'updateRequestStatus',
  tags: ['manajemen-request-laporan'],
  method: 'put',
  path: '/request/{peminjamanId}/status',
  request: {
    params: PeminjamanIdParamSchema,
    body: {
      content: { 'application/json': { schema: UpdatePeminjamanStatusSchema } },
    },
  },
  responses: {
    200: {
      description: 'Status request berhasil diperbarui',
      content: { 'application/json': { schema: PeminjamanRequestSchema } },
    },
    403: errorResponse,
    404: errorResponse,
  },
});

export const getPeminjamanScheduleRoute = createRoute({
  operationId: 'getPeminjamanSchedule',
  tags: ['manajemen-request-laporan'],
  method: 'get',
  path: '/request/{propertiId}/schedule',
  request: {
    params: PropertiIdParamSchema,
  },
  responses: {
    200: {
      description: 'Jadwal peminjaman properti',
      content: {
        'application/json': { schema: PeminjamanScheduleResponseSchema },
      },
    },
    404: errorResponse,
  },
});

export const getLaporanListRoute = createRoute({
  operationId: 'getLaporanList',
  tags: ['manajemen-request-laporan'],
  method: 'get',
  path: '/laporan',
  request: {
    query: GetLaporanParamsSchema,
  },
  responses: {
    200: {
      description: 'Daftar laporan properti',
      content: { 'application/json': { schema: PaginatedLaporanSchema } },
    },
  },
});

export const updateLaporanStatusRoute = createRoute({
  operationId: 'updateLaporanStatus',
  tags: ['manajemen-request-laporan'],
  method: 'put',
  path: '/laporan/{laporanId}/status',
  request: {
    params: LaporanIdParamSchema,
    body: {
      content: { 'application/json': { schema: UpdateLaporanStatusSchema } },
    },
  },
  responses: {
    200: {
      description: 'Status laporan berhasil diperbarui',
      content: { 'application/json': { schema: LaporanSchema } },
    },
    403: errorResponse,
    404: errorResponse,
  },
});

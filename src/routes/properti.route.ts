import { createRoute, z } from '@hono/zod-openapi';
import {
  PropertiSchema,
  GetPropertiParamsSchema,
  CreatePropertiBodySchema,
  UpdatePropertiBodySchema,
  PropertiIdParamSchema,
} from '~/types/properti.types';
import {
  ErrorSchema,
  ValidationErrorSchema,
  errorResponse,
} from '~/types/responses.type';

export const getPropertiListRoute = createRoute({
  operationId: 'getPropertiList',
  tags: ['manajemen-properti'],
  method: 'get',
  path: '/properti',
  request: {
    query: GetPropertiParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(PropertiSchema),
        },
      },
      description: 'Daftar properti',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Kesalahan dari Postgres',
    },
  },
});

export const createPropertiRoute = createRoute({
  operationId: 'createProperti',
  tags: ['manajemen-properti'],
  method: 'post',
  path: '/properti',
  request: {
    body: {
      content: { 'application/json': { schema: CreatePropertiBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Properti berhasil dibuat',
      content: { 'application/json': { schema: PropertiSchema } },
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
  },
});

export const getPropertiByIdRoute = createRoute({
  operationId: 'getPropertiById',
  tags: ['manajemen-properti'],
  method: 'get',
  path: '/properti/{propertiId}',
  request: {
    params: PropertiIdParamSchema,
  },
  responses: {
    200: {
      description: 'Detail properti',
      content: { 'application/json': { schema: PropertiSchema } },
    },
    404: {
      description: 'Properti tidak ditemukan',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

export const updatePropertiRoute = createRoute({
  operationId: 'updateProperti',
  tags: ['manajemen-properti'],
  method: 'put',
  path: '/properti/{propertiId}',
  request: {
    params: PropertiIdParamSchema,
    body: {
      content: { 'application/json': { schema: UpdatePropertiBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Properti berhasil diperbarui',
      content: { 'application/json': { schema: PropertiSchema } },
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

export const deletePropertiRoute = createRoute({
  operationId: 'deleteProperti',
  tags: ['manajemen-properti'],
  method: 'delete',
  path: '/properti/{propertiId}',
  request: {
    params: PropertiIdParamSchema,
  },
  responses: {
    204: { description: 'Properti berhasil dihapus' },
    403: errorResponse,
    404: errorResponse,
  },
});

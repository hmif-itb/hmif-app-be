import { createRoute, z } from '@hono/zod-openapi';
import {
  ListPrestasiQuerySchema,
  ListPrestasiSchema,
  PrestasiDetailSchema,
  PrestasiIdParamsSchema,
  PrestasiSchema,
} from '~/types/prestasi.types';
import {
  ErrorSchema,
  validationErrorResponse,
} from '~/types/responses.type';

export const getListPrestasiRoute = createRoute({
  operationId: 'getListPrestasi',
  tags: ['achievements'],
  method: 'get',
  path: '/achievements',
  request: {
    query: ListPrestasiQuerySchema,
  },
  responses: {
    200: {
      description: 'Fetched list of achievements',
      content: {
        'application/json': {
          schema: ListPrestasiSchema,
        },
      },
    },
    400: validationErrorResponse,
  },
});

export const getPrestasiByIdRoute = createRoute({
  operationId: 'getPrestasiById',
  tags: ['achievements'],
  method: 'get',
  path: '/achievements/{idPrestasi}',
  request: {
    params: PrestasiIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Fetched achievement by id',
      content: {
        'application/json': {
          schema: PrestasiDetailSchema,
        },
      },
    },
    400: validationErrorResponse,
    404: {
      description: 'Achievement not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

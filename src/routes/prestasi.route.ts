import { createRoute, z } from '@hono/zod-openapi';
import {
  CreatePrestasiSchema,
  CreatePrestasiResponseSchema,
  ListPrestasiQuerySchema,
  ListPrestasiSchema,
  PrestasiDetailSchema,
  PrestasiIdParamsSchema,
  UpdatePrestasiBodySchema,
} from '~/types/prestasi.types';
import {
  ErrorSchema,
  validationErrorResponse,
  errorResponse,
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

export const createPrestasiRoute = createRoute({
  operationId: 'createPrestasi',
  tags: ['achievements'],
  method: 'post',
  path: '/achievements',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePrestasiSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Prestasi created successfully',
      content: {
        'application/json': {
          schema: CreatePrestasiResponseSchema,
        },
      },
    },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    500: errorResponse,
  },
});

export const updatePrestasiRoute = createRoute({
  operationId: 'updatePrestasi',
  tags: ['achievements'],
  method: 'put',
  path: '/achievements/{idPrestasi}',
  request: {
    params: PrestasiIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdatePrestasiBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Prestasi updated successfully',
      content: {
        'application/json': {
          schema: CreatePrestasiResponseSchema,
        },
      },
    },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    500: errorResponse,
  },
});

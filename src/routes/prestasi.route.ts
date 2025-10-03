import { createRoute, z } from '@hono/zod-openapi';
import {
  ListPrestasiQuerySchema,
  ListPrestasiSchema,
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

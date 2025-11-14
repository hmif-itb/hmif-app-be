import { createRoute, z } from '@hono/zod-openapi';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';
import {
  PeminjamanSchema,
  GetPeminjamanNearingEndParamsSchema,
  GetPeminjamanParamsSchema,
} from '~/types/peminjaman.types';

export const getPeminjamanRoute = createRoute({
  operationId: 'getPeminjaman',
  tags: ['peminjaman-dashboard'],
  method: 'get',
  path: '/dashboard/peminjaman',
  request: {
    query: GetPeminjamanParamsSchema,
  },
  responses: {
    200: {
      description: 'Get list of property loans for the calendar view',
      content: {
        'application/json': {
          schema: z.array(PeminjamanSchema),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

export const getPeminjamanNearingEndRoute = createRoute({
  operationId: 'getPeminjamanNearingEnd',
  tags: ['peminjaman-dashboard'],
  method: 'get',
  path: '/dashboard/peminjaman/nearing-end',
  request: {
    query: GetPeminjamanNearingEndParamsSchema,
  },
  responses: {
    200: {
      description: 'Get list of loans that are nearing their end date',
      content: {
        'application/json': {
          schema: z.array(PeminjamanSchema),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});

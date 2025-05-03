import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { errorResponse, validationErrorResponse } from '~/types/responses.type';
import {InvoiceResponseSchema, InvoiceItemSchema, CreateInvoiceRequestSchema, UpdateInvoiceRequestSchema} from '~/types/invoices.types';


export const getInvoicesRoute = createRoute({
  operationId: 'getInvoices',
  tags: ['invoice'],
  method: 'get',
  path: '/invoices',
  request: {
    query: z.object({
      status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
      page: z.number().int().positive().optional(),
      limit: z.number().int().positive().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of invoices',
      content: {
        'application/json': {
          schema: z.array(InvoiceResponseSchema),
        },
      },
    },
    500: errorResponse,
  },
});

export const getInvoiceByIdRoute = createRoute({
  operationId: 'getInvoiceById',
  tags: ['invoice'],
  method: 'get',
  path: '/invoices/{id}',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Invoice details',
      content: {
        'application/json': {
          schema: InvoiceResponseSchema,
        },
      },
    },
    404: {
      description: 'Invoice not found',
    },
    500: errorResponse,
  },
});

export const createInvoiceRoute = createRoute({
  operationId: 'createInvoice',
  tags: ['invoice'],
  method: 'post',
  path: '/invoices',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateInvoiceRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Invoice created',
      content: {
        'application/json': {
          schema: InvoiceResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    500: errorResponse,
  },
});

export const updateInvoiceRoute = createRoute({
  operationId: 'updateInvoice',
  tags: ['invoice'],
  method: 'patch',
  path: '/invoices/{id}',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateInvoiceRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Invoice updated',
      content: {
        'application/json': {
          schema: InvoiceResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    404: {
      description: 'Invoice not found',
    },
    500: errorResponse,
  },
});

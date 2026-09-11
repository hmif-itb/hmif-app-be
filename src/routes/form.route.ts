import { createRoute, z } from '@hono/zod-openapi';
import {
  AdminListFormsSchema,
  FormAnalyticsSchema,
  FormDetailSchema,
  FormIdParamSchema,
  FormResponseSchema,
  FormResponsesCountSchema,
  ListFormResponsesQuerySchema,
  ListFormResponsesSchema,
  ListFormsSchema,
  SubmitFormResponseSchema,
} from '~/types/form.types';
import {
  errorResponse,
  ErrorSchema,
  validationErrorResponse,
  ValidationErrorSchema,
} from '~/types/responses.type';

export const listFormsRoute = createRoute({
  operationId: 'listForms',
  tags: ['form'],
  method: 'get',
  path: '/form',
  responses: {
    200: {
      description: 'List of forms eligible for the current user',
      content: { 'application/json': { schema: ListFormsSchema } },
    },
    401: errorResponse,
  },
});

export const listAllFormsRoute = createRoute({
  operationId: 'listAllForms',
  tags: ['form'],
  method: 'get',
  path: '/form/admin/list',
  responses: {
    200: {
      description:
        'List of all active forms, regardless of eligibility (admin only)',
      content: { 'application/json': { schema: AdminListFormsSchema } },
    },
    401: errorResponse,
  },
});

export const getFormRoute = createRoute({
  operationId: 'getForm',
  tags: ['form'],
  method: 'get',
  path: '/form/{formId}',
  request: { params: FormIdParamSchema },
  responses: {
    200: {
      description:
        'Form detail. `sections` is null if the form has not opened yet.',
      content: { 'application/json': { schema: FormDetailSchema } },
    },
    401: errorResponse,
    404: errorResponse,
  },
});

export const getMyFormResponseRoute = createRoute({
  operationId: 'getMyFormResponse',
  tags: ['form'],
  method: 'get',
  path: '/form/{formId}/my-response',
  request: { params: FormIdParamSchema },
  responses: {
    200: {
      description: 'My response to this form (null if not yet submitted)',
      content: {
        'application/json': { schema: FormResponseSchema.nullable() },
      },
    },
    401: errorResponse,
    404: errorResponse,
  },
});

export const submitFormResponseRoute = createRoute({
  operationId: 'submitFormResponse',
  tags: ['form'],
  method: 'post',
  path: '/form/{formId}/response',
  request: {
    params: FormIdParamSchema,
    body: {
      content: { 'application/json': { schema: SubmitFormResponseSchema } },
    },
  },
  responses: {
    201: {
      description: 'Submitted response',
      content: { 'application/json': { schema: FormResponseSchema } },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: {
      description: 'Already submitted a response for this form',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

export const listFormResponsesRoute = createRoute({
  operationId: 'listFormResponses',
  tags: ['form'],
  method: 'get',
  path: '/form/{formId}/responses',
  request: { params: FormIdParamSchema, query: ListFormResponsesQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of responses (admin only)',
      content: { 'application/json': { schema: ListFormResponsesSchema } },
    },
    401: errorResponse,
    400: validationErrorResponse,
  },
});

export const getFormResponsesCountRoute = createRoute({
  operationId: 'getFormResponsesCount',
  tags: ['form'],
  method: 'get',
  path: '/form/{formId}/responses/count',
  request: { params: FormIdParamSchema },
  responses: {
    200: {
      description: 'Total number of responses (admin only)',
      content: {
        'application/json': { schema: FormResponsesCountSchema },
      },
    },
    401: errorResponse,
  },
});

export const getFormAnalyticsRoute = createRoute({
  operationId: 'getFormAnalytics',
  tags: ['form'],
  method: 'get',
  path: '/form/{formId}/analytics',
  request: { params: FormIdParamSchema },
  responses: {
    200: {
      description: 'Aggregated analytics per question (admin only)',
      content: { 'application/json': { schema: FormAnalyticsSchema } },
    },
    401: errorResponse,
    404: errorResponse,
  },
});

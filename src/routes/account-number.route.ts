import { createRoute } from '@hono/zod-openapi';
import {
  AccountNumberParamSchema,
  AccountNumberSchema,
  ListAccountNumberSchema,
} from '~/types/account-number.types';
import { errorResponse, validationErrorResponse } from '~/types/responses.type';

export const createAccountNumberRoute = createRoute({
  operationId: 'createAccountNumber',
  tags: ['account'],
  method: 'post',
  path: '/account/numbers',
  request: {
    body: {
      content: {
        'application/json': { schema: AccountNumberSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Account number created',
      content: {
        'application/json': { schema: AccountNumberSchema },
      },
    },
    400: validationErrorResponse,
    403: errorResponse,
  },
});

export const getAccountNumbersRoute = createRoute({
  operationId: 'getAccountNumbers',
  tags: ['account'],
  method: 'get',
  path: '/account/numbers',
  responses: {
    200: {
      description: 'List of account numbers',
      content: {
        'application/json': { schema: ListAccountNumberSchema },
      },
    },
  },
});

export const deleteAccountNumberRoute = createRoute({
  operationId: 'deleteAccountNumber',
  tags: ['account'],
  method: 'delete',
  path: '/account/numbers/{accountNumber}',
  request: {
    params: AccountNumberParamSchema,
  },
  responses: {
    204: { description: 'Account number deleted' },
    400: validationErrorResponse,
    404: validationErrorResponse,
    403: errorResponse,
  },
});

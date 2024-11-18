import { createRoute } from '@hono/zod-openapi';
import {
  CoWorkingSpaceRecommendationResponseSchema,
  CoWorkingSpaceRecommendationSchema,
  VoucherRecommendationResponseSchema,
  VoucherRecommendationSchema,
} from '~/types/recommendations.types';
import {
  validationErrorResponse,
  serverErrorResponse,
} from '~/types/responses.type';

export const postRecommendationVoucherRoute = createRoute({
  operationId: 'postRecommendationVoucher',
  tags: ['recommendation'],
  method: 'post',
  path: '/recommendation/voucher',
  description: 'Create a new voucher recommendation',
  request: {
    body: {
      content: {
        'application/json': {
          schema: VoucherRecommendationSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Voucher recommendation created',
      content: {
        'application/json': {
          schema: VoucherRecommendationResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    500: serverErrorResponse,
  },
});

export const postRecommendationCoWorkingSpaceRoute = createRoute({
  operationId: 'postRecommendationCoWorkingSpace',
  tags: ['recommendation'],
  method: 'post',
  path: '/recommendation/co-working-space',
  description: 'Create a new co-working space recommendation',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CoWorkingSpaceRecommendationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Co-working space recommendation created',
      content: {
        'application/json': {
          schema: CoWorkingSpaceRecommendationResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    500: serverErrorResponse,
  },
});

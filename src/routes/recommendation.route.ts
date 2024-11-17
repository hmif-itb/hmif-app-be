import { createRoute } from '@hono/zod-openapi';
import {
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

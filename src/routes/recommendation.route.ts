import { createRoute, z } from '@hono/zod-openapi';
import {
  CoWorkingSpaceRecommendationResponseSchema,
  CoWorkingSpaceRecommendationSchema,
  VoucherRecommendationResponseSchema,
  VoucherRecommendationSchema,
  PostVoucherReviewParamsSchema,
  PostVoucherReviewResponseSchema,
  PostVoucherReviewBodySchema,
  PostCoWorkingSpaceReviewParamsSchema,
  PostCoWorkingSpaceReviewResponseSchema,
  DeleteVoucherReviewResponseSchema,
  DeleteVoucherReviewParamsSchema,
  DeleteCoWorkingSpaceReviewParamsSchema,
  DeleteCoWorkingSpaceReviewResponseSchema,
} from '~/types/recommendations.types';
import {
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
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

export const postVoucherReviewRoute = createRoute({
  operationId: 'postVoucherReview',
  tags: ['recommendation'],
  method: 'post',
  path: '/recommendation/voucher/{voucherId}/review',
  description: 'Create a new review for a voucher recommendation',
  request: {
    params: PostVoucherReviewParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: PostVoucherReviewBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Voucher review created',
      content: {
        'application/json': {
          schema: PostVoucherReviewResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    500: serverErrorResponse,
  },
});

export const postCoWorkingSpaceReviewRoute = createRoute({
  operationId: 'createCoWorkingSpaceReview',
  tags: ['recommendation'],
  method: 'post',
  path: '/recommendation/co-working-space/{coWorkingSpaceId}/review',
  request: {
    params: PostCoWorkingSpaceReviewParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: z.object({
            rating: z.number().int().min(1).max(5).openapi({
              example: 4,
              description: 'Rating for the voucher (1-5)',
            }),
            review: z.string().openapi({
              example: 'Good value for money!',
              description: 'Detailed review about the voucher',
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Co-working space review created',
      content: {
        'application/json': {
          schema: PostCoWorkingSpaceReviewResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    500: serverErrorResponse,
  },
});

export const deleteVoucherReviewRoute = createRoute({
  operationId: 'deleteVoucherReview',
  tags: ['recommendation'],
  method: 'delete',
  path: '/recommendation/voucher/{voucherId}/review/{userId}',
  description: 'Delete a review for a voucher recommendation',
  request: {
    params: DeleteVoucherReviewParamsSchema,
  },
  responses: {
    201: {
      description: 'Review deleted successfully',
      content: {
        'application/json': {
          schema: DeleteVoucherReviewResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    404: errorResponse,
    500: serverErrorResponse,
  },
});

export const deleteCoWorkingSpaceReviewRoute = createRoute({
  operationId: 'deleteCoWorkingSpaceReview',
  tags: ['recommendation'],
  method: 'delete',
  path: '/recommendation/co-working-space/{coWorkingSpaceId}/review/{userId}',
  description: 'Delete a review for a co-working space recommendation',
  request: {
    params: DeleteCoWorkingSpaceReviewParamsSchema,
  },
  responses: {
    201: {
      description: 'Review deleted successfully',
      content: {
        'application/json': {
          schema: DeleteCoWorkingSpaceReviewResponseSchema,
        },
      },
    },
    400: validationErrorResponse,
    404: errorResponse,
    500: serverErrorResponse,
  },
});

import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import {
  createCoWorkingSpaceRecommendation,
  createVoucherRecommendation,
  postVoucherReview,
  deleteVoucherReview,
  postCoWorkingSpaceReview,
  deleteCoWorkingSpaceReview,
} from '~/repositories/recommendation.repo';
import {
  postRecommendationCoWorkingSpaceRoute,
  postRecommendationVoucherRoute,
  postVoucherReviewRoute,
  postCoWorkingSpaceReviewRoute,
  deleteVoucherReviewRoute,
  deleteCoWorkingSpaceReviewRoute,
} from '~/routes/recommendation.route';
import { PostVoucherReviewParamsSchema } from '~/types/recommendations.types';
export const recommendationRoute = createAuthRouter();

recommendationRoute.openapi(postRecommendationVoucherRoute, async (c) => {
  const user = c.var.user;
  const data = c.req.valid('json');

  const recommendation = await createVoucherRecommendation(db, data, user);

  return c.json(recommendation, 201);
});

recommendationRoute.openapi(
  postRecommendationCoWorkingSpaceRoute,
  async (c) => {
    const user = c.var.user;
    const data = c.req.valid('json');

    const recommendation = await createCoWorkingSpaceRecommendation(
      db,
      data,
      user,
    );

    return c.json(recommendation, 201);
  },
);

recommendationRoute.openapi(postVoucherReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { voucherId } = c.req.valid('param');
  const { rating, review } = c.req.valid('json');

  const data = {
    userId: id,
    voucherId,
    rating,
    review,
  };
  console.log('Created data:', data);

  const voucher = await postVoucherReview(db, data);

  console.log('Created voucher review:', voucher);

  return c.json(voucher, 201);
});

recommendationRoute.openapi(postCoWorkingSpaceReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { coWorkingSpaceId } = c.req.valid('param');
  const { rating, review } = c.req.valid('json');

  const data = {
    coWorkingSpaceId,
    userId: id,
    rating,
    review,
  };
  console.log('Created data:', data);

  const voucher = await postCoWorkingSpaceReview(db, data);

  console.log('Created voucher review:', voucher);

  return c.json(voucher, 201);
});

recommendationRoute.openapi(deleteVoucherReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { userId, voucherId } = c.req.valid('param');

  if (id === userId) {
    await deleteVoucherReview(db, voucherId, userId);

    const response = {
      success: true,
    };

    return c.json(response, 201);
  } else {
    const errorResponse = {
      error: 'Unauthorized',
    };

    return c.json(errorResponse, 404);
  }
});

recommendationRoute.openapi(deleteCoWorkingSpaceReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { coWorkingSpaceId, userId } = c.req.valid('param');

  if (id === userId) {
    await deleteCoWorkingSpaceReview(db, coWorkingSpaceId, userId);

    const response = {
      success: true,
    };

    return c.json(response, 201);
  } else {
    const errorResponse = {
      error: 'Unauthorized',
    };

    return c.json(errorResponse, 404);
  }
});

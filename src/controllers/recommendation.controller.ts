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

  const voucher = await postVoucherReview(db, {
    userId: id,
    voucherId: voucherId,
    rating: rating,
    review: review,
  });

  return c.json(voucher, 201);
});

recommendationRoute.openapi(postCoWorkingSpaceReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { coWorkingSpaceId } = c.req.valid('param');
  const { rating, review } = c.req.valid('json');

  const voucher = await postCoWorkingSpaceReview(db, {
    userId: id,
    coWorkingSpaceId: coWorkingSpaceId,
    rating: rating,
    review: review,
  });

  return c.json(voucher, 201);
});

recommendationRoute.openapi(deleteVoucherReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { voucherId, userId } = c.req.valid('param');

  if (id !== userId) {
    return c.json({ success: false }, 201);
  }
  await deleteVoucherReview(db, voucherId, userId);
  return c.json({ success: true }, 201);
});

recommendationRoute.openapi(deleteCoWorkingSpaceReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { coWorkingSpaceId, userId } = c.req.valid('param');

  if (id !== userId) {
    return c.json({ success: false }, 201);
  }
  await deleteCoWorkingSpaceReview(db, coWorkingSpaceId, userId);
  return c.json({ success: true }, 201);
});

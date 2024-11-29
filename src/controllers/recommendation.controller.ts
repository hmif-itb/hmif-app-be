import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import {
  createCoWorkingSpaceRecommendation,
  createVoucherRecommendation,
  getVoucherReviewById,
  getCoWorkingSpaceReviewById,
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
import { PostgresError } from 'postgres';
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

  try {
    const voucher = await postVoucherReview(db, data);
    console.log('Created voucher review:', voucher);
    return c.json(voucher, 201);
  } catch (error) {
    if (error instanceof PostgresError) {
      console.log('Postgres error:', error);
      return c.json({ error: 'failed to create voucher review', formErrors: [], fieldErrors: { error: ['failed to create voucher review'] } }, 400);
    } else {
      return c.json({ error: 'Something went wrong', formErrors: [], fieldErrors: { error: ['Something went wrong'] } }, 500);
    }
  }
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

  try {
    const coWorkingSpaceReview = await postCoWorkingSpaceReview(db, data);
    console.log('Created co-working space review:', coWorkingSpaceReview);
    return c.json(coWorkingSpaceReview, 201);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: 'failed to create co-working space review', formErrors: [], fieldErrors: { error: ['failed to create co-working space review'] } }, 400);
    } else {
      return c.json({ error: 'Something went wrong', formErrors: [], fieldErrors: { error: ['Something went wrong'] } }, 500);
    }
  }
});

recommendationRoute.openapi(deleteVoucherReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { userId, voucherId } = c.req.valid('param');

  const voucherDB = await getVoucherReviewById(db, { voucherId, userId });
  if (!voucherDB?.voucherId) {
    return c.json({ error: 'Voucher review not found', formErrors: [], fieldErrors: { error: ['Voucher review not found'] } }, 404);
  }

  try {
    if (id === userId) {
      await deleteVoucherReview(db, voucherId, userId);

      const response = {
        success: true,
        error: '',
      };

      return c.json(response, 201);
    } else {
      return c.json({ error: 'failed to delete voucher', formErrors: [], fieldErrors: { error: ['Unauthorized'] } }, 400);
    }
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: 'failed to delete voucher', formErrors: [], fieldErrors: { error: ['failed to delete voucher'] } }, 400);
    } else {
      return c.json({ error: 'Something went wrong', formErrors: [], fieldErrors: { error: ['Something went wrong'] } }, 500);
    }
  }
});

recommendationRoute.openapi(deleteCoWorkingSpaceReviewRoute, async (c) => {
  const { id } = c.var.user;
  const { coWorkingSpaceId, userId } = c.req.valid('param');

  const coworkingDB = await getCoWorkingSpaceReviewById(db, { coWorkingSpaceId, userId });
  if (!coworkingDB?.coWorkingSpaceId) {
    return c.json({ error: 'Co-working space review not found', formErrors: [], fieldErrors: { error: ['Co-working space review not found'] } }, 404);
  } 

  try {
    if (id === userId) {
      await deleteCoWorkingSpaceReview(db, coWorkingSpaceId, userId);

      const response = {
        success: true,
        error: '',
      };

      return c.json(response, 201);
    } else {
      return c.json({ error: 'failed to delete voucher', formErrors: [], fieldErrors: { error: ['failed to delete voucher'] } }, 400);
    }
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: 'failed to delete co-working space review', formErrors: [], fieldErrors: { error: ['failed to delete co-working space review'] } }, 400);
    } else {
      return c.json({ error: 'Something went wrong', formErrors: [], fieldErrors: { error: ['Something went wrong'] } }, 500);
    }
  }
});

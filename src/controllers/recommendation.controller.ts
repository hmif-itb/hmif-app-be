import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import {
  createCoWorkingSpaceRecommendation,
  createVoucherRecommendation,
} from '~/repositories/recommendation.repo';
import {
  postRecommendationCoWorkingSpaceRoute,
  postRecommendationVoucherRoute,
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

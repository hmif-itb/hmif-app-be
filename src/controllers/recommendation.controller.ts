import { db } from '~/db/drizzle';
import { createAuthRouter } from './router-factory';
import { createVoucherRecommendation } from '~/repositories/recommendation.repo';
import { postRecommendationVoucherRoute } from '~/routes/recommendation.route';

export const recommendationRoute = createAuthRouter();

recommendationRoute.openapi(postRecommendationVoucherRoute, async (c) => {
  const user = c.var.user;
  const data = c.req.valid('json');

  const recommendation = await createVoucherRecommendation(db, data, user);

  return c.json(recommendation, 201);
});

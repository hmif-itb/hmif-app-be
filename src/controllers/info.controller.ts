import { createAuthRouter } from './router-factory';
import { createInfoRoute } from '~/routes/info.route';
import { createInfo } from '~/repositories/info.repo';
import { db } from '~/db/drizzle';

export const createInfoRouter = createAuthRouter();

createInfoRouter.openapi(createInfoRoute, async (c) => {
  const { mediaIds, ...data } = c.req.valid('json');
  return c.json(await createInfo(db, data, c.var.user.id, mediaIds), 201);
});

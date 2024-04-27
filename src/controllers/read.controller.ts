import { db } from '~/db/drizzle';
import { postReadRoute } from '~/routes/read.route';
import { createAuthRouter } from './router-factory';
import { createReadInfo } from '~/repositories/read.repo';

export const readRouter = createAuthRouter();

readRouter.openapi(postReadRoute, async (c) => {
  const userId = c.get('user').id;
  const infoId = c.req.param('id');

  try {
    const data = {
      userId,
      infoId,
    };

    const result = await createReadInfo(db, data);
    return c.json(result, 200);
  } catch (err) {
    return c.json(err, 400);
  }
});

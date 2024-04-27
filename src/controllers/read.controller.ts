import { db } from '~/db/drizzle';
import { postReadRoute } from '~/routes/read.route';
import { createAuthRouter } from './router-factory';
import { createReadInfo } from '~/repositories/read.repo';
import { PostgresError } from 'postgres';

export const readRouter = createAuthRouter();

readRouter.openapi(postReadRoute, async (c) => {
  const { id } = c.var.user;
  const { infoId } = c.req.valid('json');

  try {
    const data = {
      userId: id,
      infoId,
    };

    await createReadInfo(db, data);
    return c.json({}, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: 'User have already read this info' }, 400);
    return c.json(err, 400);
  }
});

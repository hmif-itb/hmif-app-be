import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { createReadInfo, createInfo } from '~/repositories/info.repo';
import { postReadInfoRoute, createInfoRoute } from '~/routes/info.route';
import { createAuthRouter } from './router-factory';
import { InfoSchema } from '~/types/info.types';

export const infoRouter = createAuthRouter();

infoRouter.openapi(postReadInfoRoute, async (c) => {
  const { id } = c.var.user;
  const { infoId } = c.req.valid('param');

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

infoRouter.openapi(createInfoRoute, async (c) => {
  const { mediaUrls, ...data } = c.req.valid('json');
  const { id } = c.var.user;

  try {
    const info = InfoSchema.parse(
      await createInfo(db, { ...data, creatorId: id }, mediaUrls),
    );
    return c.json(info, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: err.message }, 400);
    console.log(err);
    return c.json({ error: 'Something went wrong' }, 400);
  }
});

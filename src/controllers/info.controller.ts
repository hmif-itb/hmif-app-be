import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createInfo,
  createReadInfo,
  deleteInfo,
  getInfoById,
  getListInfos,
  notifyNewInfo,
} from '~/repositories/info.repo';
import {
  createInfoRoute,
  deleteInfoRoute,
  getInfoByIdRoute,
  getListInfoRoute,
  postReadInfoRoute,
} from '~/routes/info.route';
import { createAuthRouter } from './router-factory';

export const infoRouter = createAuthRouter();

infoRouter.openapi(postReadInfoRoute, async (c) => {
  const { id } = c.var.user;
  const { infoId } = c.req.valid('param');

  const data = {
    userId: id,
    infoId,
  };

  await createReadInfo(db, data);
  return c.json({}, 201);
});

infoRouter.openapi(createInfoRoute, async (c) => {
  const { mediaUrls, forAngkatan, forCategories, forCourses, ...data } =
    c.req.valid('json');
  const { id } = c.var.user;

  try {
    const info = await createInfo(
      db,
      { ...data, creatorId: id },
      mediaUrls,
      forAngkatan,
      forCategories,
      forCourses,
    );

    void notifyNewInfo(
      db,
      info,
      mediaUrls,
      forAngkatan,
      forCategories,
      forCourses,
    );

    return c.json(info, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: err.message }, 400);
    throw err;
  }
});

infoRouter.openapi(deleteInfoRoute, async (c) => {
  const { infoId } = c.req.valid('param');
  const info = await deleteInfo(db, infoId);
  if (!info) {
    return c.json({ error: 'Info not found' }, 404);
  }
  return c.json({}, 200);
});

infoRouter.openapi(getListInfoRoute, async (c) => {
  const infos = await getListInfos(db, c.req.valid('query'), c.var.user.id);
  return c.json(
    {
      infos,
    },
    200,
  );
});

infoRouter.openapi(getInfoByIdRoute, async (c) => {
  const { infoId } = c.req.valid('param');
  const info = await getInfoById(db, infoId, c.var.user.id);
  if (!info) {
    return c.json({ error: 'Info not found' }, 404);
  }
  return c.json(info, 200);
});

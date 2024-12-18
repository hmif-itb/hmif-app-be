import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createInfo,
  createReadInfo,
  deleteInfo,
  deleteReadInfo,
  getInfoById,
  getListInfos,
  notifyNewInfo,
  renotifyInfo,
} from '~/repositories/info.repo';
import {
  createInfoRoute,
  deleteInfoRoute,
  getInfoByIdRoute,
  getListInfoRoute,
  postReadInfoRoute,
  postRenotifyInfoRoute,
} from '~/routes/info.route';
import { createAuthRouter } from './router-factory';

export const infoRouter = createAuthRouter();

infoRouter.openapi(postReadInfoRoute, async (c) => {
  const { id } = c.var.user;
  const { infoId } = c.req.valid('param');
  const { unread } = c.req.valid('json');

  const data = {
    userId: id,
    infoId,
  };

  if (unread) {
    await deleteReadInfo(db, data);
  } else {
    await createReadInfo(db, data);
  }
  return c.json({}, 200);
});

infoRouter.openapi(createInfoRoute, async (c) => {
  const {
    mediaUrls,
    forAngkatan,
    forCategories,
    forCourses,
    forGroups,
    ...data
  } = c.req.valid('json');
  const { id } = c.var.user;

  try {
    const info = await createInfo(
      db,
      { ...data, creatorId: id },
      mediaUrls,
      forAngkatan,
      forCategories,
      forCourses,
      forGroups,
    );

    void notifyNewInfo(
      db,
      info,
      mediaUrls,
      forAngkatan,
      forCategories,
      forCourses,
      forGroups,
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
  const infos = await getListInfos(
    db,
    c.req.valid('query'),
    c.var.user.id,
    c.var.user.angkatan,
  );
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

infoRouter.openapi(postRenotifyInfoRoute, async (c) => {
  const { id: userId } = c.var.user;
  const { infoId } = c.req.valid('param');

  const info = await getInfoById(db, infoId, userId);
  if (info?.creatorId !== userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!info.canNotify) {
    return c.json({ error: 'Info cannot be notified' }, 400);
  }

  await renotifyInfo(db, info);

  return c.json({}, 200);
});

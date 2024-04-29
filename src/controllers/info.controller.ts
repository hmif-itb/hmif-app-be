import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { listInfoRoute } from '../routes/info.route';
import { postReadInfoRoute, createInfoRoute } from '~/routes/info.route';
import { createAuthRouter, createRouter } from './router-factory';
import { InfoSchema } from '~/types/info.types';
import {
  createReadInfo,
  createInfo,
  GetAllListInfos,
  GetListInfosCategory,
  GetListInfosCategoryUnread,
  GetListInfosSearch,
  GetListInfosSearchCategory,
  GetListInfosSearchCategoryUnread,
  GetListInfosUnread,
} from '~/repositories/info.repo';

export const infoRouter = createRouter();
export const infoProtectedRouter = createAuthRouter();

infoProtectedRouter.openapi(postReadInfoRoute, async (c) => {
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

infoProtectedRouter.openapi(createInfoRoute, async (c) => {
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

infoRouter.openapi(listInfoRoute, async (c) => {
  const { search, category, unread, userId, offset } = c.req.query();
  if (!unread || !userId || !offset) {
    return c.json(
      {
        error:
          'request should have unread, userId, and offset filled in query param',
      },
      400,
    );
  }
  const offsetNumber = parseInt(offset, 10);
  if (search && search !== '') {
    if (category && category !== '') {
      if (unread && unread === 'true') {
        const infos = await GetListInfosSearchCategoryUnread(
          db,
          userId,
          search,
          category,
          offsetNumber,
        );
        return c.json(
          {
            infos,
          },
          200,
        );
        // Return infos based on search, category and unread
      }
      const infos = await GetListInfosSearchCategory(
        db,
        search,
        category,
        offsetNumber,
      );
      return c.json(
        {
          infos,
        },
        200,
      );
      // Return infos based on search, category
    }
    const infos = await GetListInfosSearch(db, search, offsetNumber);
    return c.json(
      {
        infos,
      },
      200,
    );
    // Return infos based on search only
  }

  if (category && category !== '') {
    if (unread && unread === 'true') {
      const infos = await GetListInfosCategoryUnread(
        db,
        userId,
        category,
        offsetNumber,
      );
      return c.json(
        {
          infos,
        },
        200,
      );
      // Return infos based on category and unread
    }
    const infos = await GetListInfosCategory(db, category, offsetNumber);
    return c.json(
      {
        infos,
      },
      200,
    );
    // Return infos based on category only
  }

  if (unread && unread === 'true') {
    const infos = await GetListInfosUnread(db, userId, offsetNumber);
    return c.json(
      {
        infos,
      },
      200,
    );
    // Return infos based on unread
  }

  const infos = await GetAllListInfos(db, offsetNumber);
  return c.json(
    {
      infos,
    },
    200,
  );
});

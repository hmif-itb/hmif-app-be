import { createRouter } from './router-factory';
import { listInfoRoute } from '../routes/info.route';
import {
  GetAllListInfos,
  GetListInfosCategory,
  GetListInfosCategoryUnread,
  GetListInfosSearch,
  GetListInfosSearchCategory,
  GetListInfosSearchCategoryUnread,
  GetListInfosUnread,
} from '~/repositories/info.repo';
import { db } from '~/db/drizzle';

export const infoRouter = createRouter();

infoRouter.openapi(listInfoRoute, async (c) => {
  const { search, category, unread, userId, offset } = c.req.query();
  if (!unread || !userId || !offset) {
    return c.json(
      {
        error: "request should have unread, userId, and offset filled in query param",
      },
      400,
    );
  }
  const offsetNumber = parseInt(offset, 10);
  if (search && search != '') {
    if (category && category != '') {
      if (unread && unread == 'true') {
        const infos = await GetListInfosSearchCategoryUnread(
          db,
          userId,
          search,
          category,
          offsetNumber
        );
        return c.json(
          {
            infos: infos,
          },
          200,
        );
        // Return infos based on search, category and unread
      }
      const infos = await GetListInfosSearchCategory(db, search, category, offsetNumber);
      return c.json(
        {
          infos: infos,
        },
        200,
      );
      // Return infos based on search, category
    }
    const infos = await GetListInfosSearch(db, search, offsetNumber);
    return c.json(
      {
        infos: infos,
      },
      200,
    );
    // Return infos based on search only
  }

  if (category && category != '') {
    if (unread && unread == 'true') {
      const infos = await GetListInfosCategoryUnread(db, userId, category, offsetNumber);
      return c.json(
        {
          infos: infos,
        },
        200,
      );
      // Return infos based on category and unread
    }
    const infos = await GetListInfosCategory(db, category, offsetNumber);
    return c.json(
      {
        infos: infos,
      },
      200,
    );
    // Return infos based on category only
  }

  if (unread && unread == 'true') {
    const infos = await GetListInfosUnread(db, userId, offsetNumber);
    return c.json(
      {
        infos: infos,
      },
      200,
    );
    // Return infos based on unread
  }

  const infos = await GetAllListInfos(db, offsetNumber);
  return c.json(
    {
      infos: infos,
    },
    200,
  );
  //Return all infos
});

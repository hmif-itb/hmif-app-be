import { createRouter } from './router-factory';
import { listInfoRoute } from '../routes/info.route';
import { GetAllListInfos, GetListInfosCategory, GetListInfosCategoryUnread, GetListInfosSearch, GetListInfosSearchCategory, GetListInfosSearchCategoryUnread, GetListInfosUnread } from '~/repositories/info.repo';
import { db } from '~/db/drizzle';

export const infoRouter = createRouter();

infoRouter.openapi(listInfoRoute, async (c) => {
  const { search, category, isRead, userId} = c.req.query();
  console.log(search)
  if (search && search != ""){
    if (category && category != ""){
        if (isRead && isRead == "false"){
          const infos =  await GetListInfosSearchCategoryUnread(db, userId, search, category)
          return c.json({
            infos: infos
          }, 200)
          // Return infos based on search, category and unread
        }
        const infos =  await GetListInfosSearchCategory(db, search, category)
          return c.json({
            infos: infos
          }, 200)
         // Return infos based on search, category
    }
    const infos =  await GetListInfosSearch(db, search)
    return c.json({
      infos: infos
    }, 200)
    // Return infos based on search only
  }
    
  if(category && category != ""){
    if (isRead && isRead == "false"){
      const infos =  await GetListInfosCategoryUnread(db, userId, category)
      return c.json({
        infos: infos
      }, 200)
        // Return infos based on category and unread
    }
    const infos =  await GetListInfosCategory(db, category)
      return c.json({
        infos: infos
      }, 200)
      // Return infos based on category only
  }

  if(isRead && isRead  == "false"){
    console.log(userId)
    const infos =  await GetListInfosUnread(db, userId)
      return c.json({
        infos: infos
      }, 200)
    // Return infos based on unread
  }

  const infos =  await GetAllListInfos(db)
    return c.json({
      infos: infos
    }, 200)
  //Return all infos


});

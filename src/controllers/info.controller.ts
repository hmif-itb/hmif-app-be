import { createRouter } from './router-factory';
import { listInfoRoute } from '../routes/info.route';

export const infoRouter = createRouter();

infoRouter.openapi(listInfoRoute, (c) => {
  const { search, category, isRead } = c.req.valid("param");
  if (search != ""){
    if (category != ""){
        if (isRead == "false"){
            // Return infos based on search, category and unread
        }
         // Return infos based on search, category
    }
    // Return infos based on search only
  }
    
  if(category != ""){
    if (isRead == "false"){
        // Return infos based on category and unread
    }
        // Return infos based on category only
  }

  if(isRead  == "false"){
    // Return infos based on unread
  }

  //Return all infos


});

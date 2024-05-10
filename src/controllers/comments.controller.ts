import { db } from '~/db/drizzle';
import { deleteCommentRoute, postCommentRoute } from '~/routes/comments.route';
import { createAuthRouter } from './router-factory';
import { createComment, deleteComment } from '~/repositories/comments.repo';

export const commentsRouter = createAuthRouter();

commentsRouter.openapi(postCommentRoute, async (c) => {
    const { id } = c.var.user;
    const { infoId, content } = c.req.valid('json')
    if(infoId === "" || !infoId || content === "" || !content){
        return c.json("request should have info id and content id", 400);
    }
  
    try {
      const data = {
        creatorId: id,
        repliedInfoId: infoId,
        content,

      };
  
      await createComment(db, data);
      return c.json("comment posted succesfully", 201);
    } catch (err) {
      return c.json(err, 400);
    }
});

commentsRouter.openapi(deleteCommentRoute, async (c) => {
    const { commentId } = c.req.valid('param')
    if(commentId === "" || !commentId){
        return c.json("request should have content id", 400);
    }
  
    try {  
      await deleteComment(db, commentId);
      return c.json("comment deleted successfully", 200);
    } catch (err) {
      return c.json(err, 500);
    }
});
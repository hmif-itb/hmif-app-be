import { db } from '~/db/drizzle';
import { postCommentRoute } from '~/routes/comments.route';
import { createAuthRouter } from './router-factory';
import { createComment } from '~/repositories/comments.repo';

export const commentsRouter = createAuthRouter();

commentsRouter.openapi(postCommentRoute, async (c) => {
    const { id } = c.var.user;
    const { infoId, content } = c.req.valid('json')
  
    try {
      const data = {
        creatorId: id,
        repliedInfoId: infoId,
        content,

      };
  
      await createComment(db, data);
      return c.json({}, 201);
    } catch (err) {
      return c.json(err, 400);
    }
});
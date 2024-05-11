import {
  getCommentsListRoute,
  getCommentsbyIdRoute,
} from '~/routes/comment.route';
import { createAuthRouter } from './router-factory';
import { getCommentList, getCommentById } from '~/repositories/comment.repo';
import { db } from '~/db/drizzle';

export const commentRouter = createAuthRouter();

commentRouter.openapi(getCommentsListRoute, async (c) => {
  const query = c.req.valid('query');
  const comment = await getCommentList(db, query);
  return c.json({ comment }, 200);
});

commentRouter.openapi(getCommentsbyIdRoute, async (c) => {
  const param = c.req.valid('param');
  const comment = await getCommentById(db, param);
  return c.json({ comment }, 200);
});

import {
  getCommentsListRoute,
  getCommentsbyIdRoute,
  updateCommentContentRoute,
} from '~/routes/comment.route';
import { createAuthRouter } from './router-factory';
import {
  getCommentList,
  getCommentById,
  updateCommentContent,
} from '~/repositories/comment.repo';
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
  if (!comment) {
    return c.json({ error: 'Comment not found' }, 404);
  }
  return c.json(comment, 200);
});

commentRouter.openapi(updateCommentContentRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const param = c.req.valid('param');
    const comment = await updateCommentContent(db, param, data);
    if (!comment) return c.json({ error: 'Comment not found' }, 404);
    return c.json(comment, 200);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Bad request' }, 400);
  }
});

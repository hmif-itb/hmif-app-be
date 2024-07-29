import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentList,
  updateCommentContent,
} from '~/repositories/comment.repo';
import {
  deleteCommentRoute,
  getCommentsByIdRoute,
  getCommentsListRoute,
  postCommentRoute,
  updateCommentContentRoute,
} from '~/routes/comment.route';
import { createAuthRouter } from './router-factory';

export const commentRouter = createAuthRouter();

commentRouter.openapi(getCommentsListRoute, async (c) => {
  const query = c.req.valid('query');
  const comment = await getCommentList(db, query, c.var.user.id);
  return c.json({ comment }, 200);
});

commentRouter.openapi(getCommentsByIdRoute, async (c) => {
  const param = c.req.valid('param');
  const comment = await getCommentById(db, param);
  if (!comment) {
    return c.json({ error: 'Comment not found' }, 404);
  }
  return c.json(comment, 200);
});

commentRouter.openapi(postCommentRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const userId = c.var.user.id;
    const comment = await createComment(db, data, userId);
    return c.json({ ...comment, creator: c.var.user }, 201);
  } catch (err) {
    if (err instanceof PostgresError)
      return c.json({ error: err.message }, 400);
    throw err;
  }
});

commentRouter.openapi(deleteCommentRoute, async (c) => {
  try {
    const { commentId } = c.req.valid('param');
    const comment = await deleteComment(db, commentId);
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    return c.json({ ...comment, creator: c.var.user }, 200);
  } catch (err) {
    return c.json({ error: err }, 500);
  }
});

commentRouter.openapi(updateCommentContentRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const param = c.req.valid('param');
    const comment = await updateCommentContent(db, param, data);
    if (!comment) return c.json({ error: 'Comment not found' }, 404);
    return c.json({ ...comment, creator: c.var.user }, 200);
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: 'Bad request' }, 400);
  }
});

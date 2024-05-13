import {
  getCommentsListRoute,
  getCommentsbyIdRoute,
  postCommentRoute,
  deleteCommentRoute,
  updateCommentContentRoute,
} from '~/routes/comment.route';
import { createAuthRouter } from './router-factory';
import {
  getCommentList,
  getCommentById,
  createComment,
  deleteComment,
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

commentRouter.openapi(postCommentRoute, async (c) => {
  const { id } = c.var.user;
  const { infoId, content } = c.req.valid('json');
  if (infoId === '' || !infoId || content === '' || !content) {
    return c.json('request should have info id and content id', 400);
  }

  try {
    const data = {
      creatorId: id,
      repliedInfoId: infoId,
      content,
    };

    await createComment(db, data);
    return c.json('comment posted succesfully', 201);
  } catch (err) {
    return c.json(err, 400);
  }
});

commentRouter.openapi(deleteCommentRoute, async (c) => {
  const { commentId } = c.req.valid('param');
  if (commentId === '' || !commentId) {
    return c.json('request should have content id', 400);
  }

  try {
    await deleteComment(db, commentId);
    return c.json('comment deleted successfully', 200);
  } catch (err) {
    return c.json(err, 500);
  }
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

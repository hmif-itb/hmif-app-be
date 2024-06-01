import { db } from '~/db/drizzle';
import {
  createOrUpdateReaction,
  deleteReaction,
  getReactions,
} from '~/repositories/reaction.repo';
import {
  CreateOrUpdateReactionRoute,
  deleteCommentReactionRoute,
  deleteInfoReactionRoute,
  getReactionsRoute,
} from '~/routes/reaction.route';
import { createAuthRouter } from './router-factory';

export const reactionRouter = createAuthRouter();

reactionRouter.openapi(getReactionsRoute, async (c) => {
  try {
    const reactions = await getReactions(
      db,
      c.req.valid('query'),
      c.var.user.id,
    );
    if (!reactions) return c.json({ error: 'No reactions found' }, 404);
    return c.json(reactions, 200);
  } catch (err) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      400,
    );
  }
});

reactionRouter.openapi(CreateOrUpdateReactionRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const reaction = await createOrUpdateReaction(db, data, c.var.user.id);

    if (!reaction) return c.json({ error: 'Reaction not found' }, 404);
    return c.json(reaction, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json(
        {
          error: err.message,
        },
        400,
      );
    } else {
      return c.json(
        {
          error: 'Something went wrong',
        },
        400,
      );
    }
  }
});

reactionRouter.openapi(deleteCommentReactionRoute, async (c) => {
  try {
    const { commentId } = c.req.valid('param');
    const reaction = await deleteReaction(
      db,
      commentId,
      c.var.user.id,
      'comment',
    );

    if (!reaction) return c.json({ error: 'Reaction not found' }, 404);
    return c.json(reaction, 200);
  } catch (err) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      400,
    );
  }
});

reactionRouter.openapi(deleteInfoReactionRoute, async (c) => {
  try {
    const { infoId } = c.req.valid('param');
    const reaction = await deleteReaction(db, infoId, c.var.user.id, 'info');

    if (!reaction) return c.json({ error: 'Reaction not found' }, 404);
    return c.json(reaction, 200);
  } catch (err) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      400,
    );
  }
});

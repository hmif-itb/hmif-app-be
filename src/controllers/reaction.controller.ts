import { createAuthRouter } from './router-factory';
import {
  createOrUpdateReaction,
  deleteReaction,
  getReactions,
} from '~/repositories/reaction.repo';
import {
  CreateOrUpdateReactionRoute,
  deleteReactionRoute,
  getReactionsRoute,
} from '~/routes/reaction.route';
import { db } from '~/db/drizzle';

export const reactionRouter = createAuthRouter();

reactionRouter.openapi(getReactionsRoute, async (c) => {
  try {
    const reactions = await getReactions(db, c.req.valid('query'));
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

reactionRouter.openapi(deleteReactionRoute, async (c) => {
  try {
    const { reactionId } = c.req.valid('param');
    const reaction = await deleteReaction(db, reactionId);

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

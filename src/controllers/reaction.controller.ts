import {
  deleteReactionRoute,
  getReactionsRoute,
} from '~/routes/reaction.route';
import { createAuthRouter } from './router-factory';
import { deleteReaction, getReactions } from '~/repositories/reaction.repo';
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

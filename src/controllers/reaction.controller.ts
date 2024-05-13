import { updateReactionRoute } from '~/routes/reaction.route';
import { createAuthRouter } from './router-factory';
import { updateReaction } from '~/repositories/reaction.repo';
import { db } from '~/db/drizzle';

export const reactionRouter = createAuthRouter();

reactionRouter.openapi(updateReactionRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const reaction = await updateReaction(db, data, c.var.user.id);

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

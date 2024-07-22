import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { db } from '~/db/drizzle';
import { getUserRoles } from '~/repositories/user-role.repo';
import { JWTPayloadSchema } from '~/types/login.types';

const factory = createFactory<{
  Variables: {
    user: z.infer<typeof JWTPayloadSchema>;
  };
}>();

export const roleMiddleware = (accessRoles: string[]) => {
  return factory.createMiddleware(async (c, next) => {
    const roles = await getUserRoles(db, c.var.user.id);

    if (!roles.some((r) => accessRoles.includes(r))) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
  });
};

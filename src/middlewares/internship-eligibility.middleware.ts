import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { JWTPayloadSchema } from '~/types/login.types';

const factory = createFactory<{
  Variables: {
    user: z.infer<typeof JWTPayloadSchema>;
  };
}>();

export const ELIGIBLE_SPARTA_ANGKATAN = [2025];

export const internshipEligibilityMiddleware = factory.createMiddleware(
  async (c, next) => {
    if (!ELIGIBLE_SPARTA_ANGKATAN.includes(c.var.user.angkatan)) {
      return c.json(
        { error: 'You are not eligible to access SPARTA internship form' },
        401,
      );
    }

    await next();
  },
);

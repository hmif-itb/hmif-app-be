import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { JWTPayloadSchema } from '~/types/login.types';

const factory = createFactory<{
  Variables: {
    user: z.infer<typeof JWTPayloadSchema>;
  };
}>();

export const ELIGIBLE_SPARTA_ANGKATAN = [2025];

// Manually approved exceptions: these NIMs are not angkatan 2025 but have
// been designated eligible for the SPARTA internship form regardless.
export const ELIGIBLE_SPARTA_NIM_OVERRIDES = [
  '13524108', // Daffa Mutaqin Tetaputra
  '18224053', // Nathan Pasha Athallah
  '18224112', // Muhammad Reyna Athallah Agoes
];

export const internshipEligibilityMiddleware = factory.createMiddleware(
  async (c, next) => {
    const isEligible =
      ELIGIBLE_SPARTA_ANGKATAN.includes(c.var.user.angkatan) ||
      ELIGIBLE_SPARTA_NIM_OVERRIDES.includes(c.var.user.nim);

    if (!isEligible) {
      return c.json(
        { error: 'You are not eligible to access SPARTA internship form' },
        401,
      );
    }

    await next();
  },
);

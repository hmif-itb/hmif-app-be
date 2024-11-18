import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import {
  coWorkingSpaceRecommendations,
  voucherRecommendations,
} from '~/db/schema';
import type { JWTPayloadSchema } from '~/types/login.types';
import type {
  CoWorkingSpaceRecommendationSchema,
  VoucherRecommendationSchema,
} from '~/types/recommendations.types';

export const createVoucherRecommendation = async (
  db: Database,
  data: z.infer<typeof VoucherRecommendationSchema>,
  user: z.infer<typeof JWTPayloadSchema>,
) => {
  const recommendation = await db
    .insert(voucherRecommendations)
    .values({
      ...data,
      creatorId: user.id,
      startPeriod: data.startPeriod ? new Date(data.startPeriod) : null,
      endPeriod: data.endPeriod ? new Date(data.endPeriod) : null,
    })
    .returning()
    .then(firstSure);

  return recommendation;
};

export const createCoWorkingSpaceRecommendation = async (
  db: Database,
  data: z.infer<typeof CoWorkingSpaceRecommendationSchema>,
  user: z.infer<typeof JWTPayloadSchema>,
) => {
  const recommendation = await db
    .insert(coWorkingSpaceRecommendations)
    .values({
      ...data,
      creatorId: user.id,
    })
    .returning()
    .then(firstSure);

  return recommendation;
};

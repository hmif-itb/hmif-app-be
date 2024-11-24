import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { InferInsertModel, and, eq } from 'drizzle-orm';
import {
  coWorkingSpaceRecommendations,
  voucherRecommendations,
  voucherReviews,
  coWorkingSpaceReviews,
} from '~/db/schema';
import type { JWTPayloadSchema } from '~/types/login.types';
import type {
  CoWorkingSpaceRecommendationSchema,
  VoucherRecommendationSchema,
  VoucherReviewSchema,
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

export const postVoucherReview = async (
  db: Database,
  data: z.infer<typeof VoucherReviewSchema>,
) => {
  const review = await db
    .insert(voucherReviews)
    .values({
      ...data,
    })
    .returning()
    .then(firstSure);

  return review;
};

/**
 * Insert a new coworking space review
 * @param db Database instance
 * @param review Review object to insert
 * @returns Inserted review or undefined if insertion fails
 */
export async function postCoWorkingSpaceReview(
  db: Database,
  data: InferInsertModel<typeof coWorkingSpaceReviews>,
) {
  return await db
    .insert(coWorkingSpaceReviews)
    .values(data)
    .onConflictDoNothing()
    .returning()
    .then(firstSure);
}

/**
 * Delete a voucher review
 * @param db Database instance
 * @param voucherId ID of the voucher recommendation
 * @param userId ID of the user who made the review
 * @returns Deleted review or undefined if no review was deleted
 */
export async function deleteVoucherReview(
  db: Database,
  voucherId: string,
  userId: string,
) {
  return await db
    .delete(voucherReviews)
    .where(
      and(
        eq(voucherReviews.voucherId, voucherId),
        eq(voucherReviews.userId, userId),
      ),
    )
    .returning()
    .then(firstSure);
}

/**
 * Delete a coworking space review
 * @param db Database instance
 * @param coWorkingSpaceId ID of the coworking space recommendation
 * @param userId ID of the user who made the review
 * @returns Deleted review or undefined if no review was deleted
 */
export async function deleteCoWorkingSpaceReview(
  db: Database,
  coWorkingSpaceId: string,
  userId: string,
) {
  return await db
    .delete(coWorkingSpaceReviews)
    .where(
      and(
        eq(coWorkingSpaceReviews.coWorkingSpaceId, coWorkingSpaceId),
        eq(coWorkingSpaceReviews.userId, userId),
      ),
    )
    .returning()
    .then(firstSure);
}

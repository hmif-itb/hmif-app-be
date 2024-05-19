import { Database } from '~/db/drizzle';
import { InferInsertModel, and, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  DeleteUserUnsubscribeCategorySchema,
  GetUserUnsubscribeCategorySchema,
  PostUserUnsubscribeCategorySchema,
} from '~/types/user-unsubscribe.types';
import { userUnsubscribeCategories } from '~/db/schema';
import { firstSure } from '~/db/helper';

/**
 * Check if a user is unsubscribed to a category with the given categoryId
 * @param db Database to be used
 * @param q \{userId to be checked, categoryId to be checked\}
 * @returns \{userId, categoryId\} if the user is unsubscribed to the category, undefined otherwise
 */
export async function getUserUnsubscribeCategory(
  db: Database,
  q: z.infer<typeof GetUserUnsubscribeCategorySchema>,
) {
  const { userId, categoryId } = q;
  return await db.query.userUnsubscribeCategories.findFirst({
    where: and(
      eq(userUnsubscribeCategories.categoryId, categoryId),
      eq(userUnsubscribeCategories.userId, userId),
    ),
  });
}

/**
 * Get the list of all categories which the user is unsubscribed to
 * @param db Database to be used
 * @param userId Id of the user whose unsubscriptions will be checked
 * @returns Array of categoryIds which the user has unsubscribed to, or an empty array if the user has not unsubscribed to any category
 */
export async function getListUserUnsubscribeCategory(
  db: Database,
  userId: string,
) {
  const res = await db.query.userUnsubscribeCategories.findMany({
    columns: {
      categoryId: true,
    },
    where: eq(userUnsubscribeCategories.userId, userId),
  });

  return res;
}

/**
 * Insert a single category unsubscription
 * @param db Database to be used
 * @param q \{userId who unsubcribes, categoryId to be unsubscribed to\}
 * @returns \{userId, categoryId\}
 */
export async function postUserUnsubcribeCategory(
  db: Database,
  q: InferInsertModel<typeof userUnsubscribeCategories>,
) {
  return await db
    .insert(userUnsubscribeCategories)
    .values(q)
    .onConflictDoNothing()
    .returning()
    .then(firstSure);
}

/**
 * Insert multiple category unsubscriptions
 * @param db Database to be used
 * @param q Array of \{userId who unsubcribes, categoryId to be unsubscribed to\}
 * @returns Array of \{userId, categoryId\}
 */
export async function postListUserUnsubcribeCategory(
  db: Database,
  q: Array<z.infer<typeof PostUserUnsubscribeCategorySchema>>,
) {
  return await db
    .insert(userUnsubscribeCategories)
    .values(q)
    .onConflictDoNothing()
    .returning()
    .then(firstSure);
}

/**
 * Delete a single category unsubscription (Subscribes a user back to a category)
 * @param db Database to be used
 * @param q \{userId who unsubcribes, categoryId to be subscribed to\}
 * @returns \{userId, categoryId\}
 */
export async function deleteUserUnsubscribeCategory(
  db: Database,
  q: z.infer<typeof DeleteUserUnsubscribeCategorySchema>,
  userId: string,
) {
  return await db
    .delete(userUnsubscribeCategories)
    .where(
      and(
        eq(userUnsubscribeCategories.userId, userId),
        eq(userUnsubscribeCategories.categoryId, q.categoryId),
      ),
    )
    .returning()
    .then(firstSure);
}

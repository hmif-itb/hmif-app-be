import { Database } from '~/db/drizzle';
import { InferInsertModel, and, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  DeleteUserUnsubscribeCategorySchema,
  GetUserUnsubscribeCategorySchema,
  PostListUserUnsubscribeCategorySchema,
  PostUserUnsubscribeCategorySchema,
} from '~/types/user-unsubscribe.types';
import { userUnsubscribeCategories } from '~/db/schema';
import { firstSure } from '~/db/helper';

// Select a specific category
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

// Insert an unsubscription
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

// Insert multiple unsubscriptions
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

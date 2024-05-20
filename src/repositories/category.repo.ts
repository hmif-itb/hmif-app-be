import { Database } from '~/db/drizzle';
import { eq } from 'drizzle-orm';
import { categories } from '~/db/schema';

/**
 * Check if a category with the given categoryId exists
 * @param db Database to be used
 * @param categoryId Id of the category to check
 * @returns false if category doesn't exist, {id, name, and requiredPush} if it exists
 */
export async function isCategoryExists(db: Database, categoryId: string) {
  const q = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });

  if (!q) {
    return false;
  }

  return q;
}

/**
 * Check if a given category is required to be subscribed
 * @param db Database to be used
 * @param categoryId Id of the category to check
 * @returns \{id, name=null, requiredPush=null} if category doesn't exist, \{id, name, requiredPush} if it exists
 */
export async function checkRequired(db: Database, categoryId: string) {
  const category = await isCategoryExists(db, categoryId);
  if (!category) {
    return {
      id: categoryId,
      name: null,
      requiredPush: null,
    };
  }

  return {
    id: category.id,
    name: category.name,
    requiredPush: category.requiredPush,
  };
}

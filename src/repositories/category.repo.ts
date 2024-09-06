import { asc, eq, exists, isNull, or, sql } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { angkatan, categories, UserRolesEnum } from '~/db/schema';

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

export async function getCategoryList(db: Database) {
  return await db.select().from(categories).orderBy(asc(categories.name));
}

export async function getInfoCategoryList(
  db: Database,
  userRoles: UserRolesEnum[],
) {
  return await db
    .select()
    .from(categories)
    .where(
      or(
        isNull(categories.rolesAllowed),
        userRoles.length === 0
          ? undefined
          : exists(
              sql`(SELECT 1 FROM json_array_elements_text(${categories.rolesAllowed}) AS role WHERE role IN (${sql.join(
                userRoles.map((role) => sql`${role}`),
                sql.raw(','),
              )}))`,
            ),
      ),
    )
    .orderBy(asc(categories.name));
}

export async function getListAngkatan(db: Database) {
  return await db.select().from(angkatan).orderBy(asc(angkatan.year));
}

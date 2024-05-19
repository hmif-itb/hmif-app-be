import { eq, getTableColumns } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { categories } from '~/db/schema';

export async function getCategoryList(db: Database) {
  return await db.select({ ...getTableColumns(categories) }).from(categories);
}

export async function getCategoryById(db: Database, id: string) {
  return await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
}

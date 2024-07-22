import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { userRoles } from '~/db/schema';

export async function getUserRoles(db: Database, userId: string) {
  const roles = (
    await db.select().from(userRoles).where(eq(userRoles.userId, userId))
  ).map((r) => r.role);
  return roles;
}

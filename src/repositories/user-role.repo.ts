import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { userRoles, UserRolesEnum } from '~/db/schema';

export async function getUserRoles(db: Database, userId: string) {
  const roles = (
    await db.select().from(userRoles).where(eq(userRoles.userId, userId))
  ).map((r) => r.role);
  return roles;
}

export async function getUsersByRole(db: Database, role: UserRolesEnum) {
  return (
    await db.query.userRoles.findMany({
      where: eq(userRoles.role, role),
      with: {
        user: true,
      },
    })
  ).map((ur) => ur.user);
}

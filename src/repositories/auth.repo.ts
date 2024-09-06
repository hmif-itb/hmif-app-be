import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { rolesGroup } from '~/db/roles-group';
import { users } from '~/db/schema';
import { UserGroupsSchema } from '~/types/user.types';
import { getUserRoles } from './user-role.repo';

export async function findUserByEmail(db: Database, email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function updateUserLastLogin(db: Database, id: string) {
  return await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, id));
}

export async function getUserAndUpdatePicture(
  db: Database,
  email: string,
  picture: string,
) {
  return await db
    .update(users)
    .set({
      picture,
    })
    .where(eq(users.email, email))
    .returning()
    .then(first);
}

export async function getUserGroups(
  db: Database,
  userId: string,
): Promise<z.infer<typeof UserGroupsSchema>> {
  const roles = await getUserRoles(db, userId);

  return roles.map((role) => ({
    role,
    group: rolesGroup[role],
  }));
}

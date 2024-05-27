import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { users } from '~/db/schema';

export async function findUserByEmail(db: Database, email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
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

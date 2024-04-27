import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { users } from '~/db/schema';

export async function findUserByEmail(db: Database, email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

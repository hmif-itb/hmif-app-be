import { like, or } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { users } from '~/db/schema';
import { NimFinderQuerySchema } from '~/types/user-finder.types';

export async function getUserByNimOrName(
  db: Database,
  q: z.infer<typeof NimFinderQuerySchema>,
) {
  const { search } = q;
  const whereName = like(users.fullName, `%${search}%`);
  const whereNim = like(users.nim, `%${search}%`);
  return await db.select().from(users).where(or(whereNim, whereName));
}

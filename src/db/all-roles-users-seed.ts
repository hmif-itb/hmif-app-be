import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { userRoles, users } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

export async function runUserSeed() {
  const data = await db.select().from(users);

  if (data.length > 0) {
    await db
      .insert(userRoles)
      .values(
        data.flatMap((user) =>
          userRoles.role.enumValues.map((role) => ({
            userId: user.id,
            role,
          })),
        ),
      )
      .onConflictDoNothing();
  }
}

async function runAllSeeds() {
  try {
    await runUserSeed();
    await client.end();
  } catch (error) {
    console.log(error);
  }
}

if (require.main === module) {
  void runAllSeeds();
}

import 'dotenv/config';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createInsertSchema } from 'drizzle-zod';
import { parse } from 'csv-parse';
import fs from 'fs';
import postgres from 'postgres';
import { z } from 'zod';
import { userRoles, users } from '../schema';

// Deferred step — DO NOT run until src/db/seed/admin-users.csv has been
// filled in with the 6 admins' fullName/major/gender/membershipStatus/region
// (user said they'd send this data after the rest of the feature ships).
//
// Once the CSV is filled in, run with:
//   pnpm exec tsx src/db/seed/admin-users-seed.ts
//
// This inserts the 6 users (if not already present) and grants them the
// 'admin' role via user_roles. Safe to re-run (onConflictDoNothing both
// steps).

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const dataSchema = createInsertSchema(users, {
  email: z
    .string()
    .email()
    .refine((value) => value.endsWith('@std.stei.itb.ac.id')),
  fullName: z.string().min(1),
  major: z.enum(['IF', 'STI']),
  region: z.enum(['Ganesha', 'Jatinangor']),
  gender: z.enum(['F', 'M']),
  membershipStatus: z.enum([
    'Anggota Biasa',
    'Anggota Kehormatan',
    'Anggota Muda',
  ]),
  angkatan: z.number().int(),
});

async function run() {
  const filePath = 'src/db/seed/admin-users.csv';
  const data: Array<typeof users.$inferInsert> = [];
  const nims: string[] = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', (row) => {
        const user = dataSchema.parse({
          angkatan: +row[0],
          nim: row[1],
          fullName: row[2],
          major: row[3],
          gender: row[4],
          membershipStatus: row[5],
          email: row[6],
          region: row[7],
        });
        data.push(user);
        nims.push(user.nim);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`💾 Inserting ${data.length} admin users...`);
  await db.insert(users).values(data).onConflictDoNothing();

  const insertedUsers = await db
    .select({ id: users.id, nim: users.nim })
    .from(users)
    .where(inArray(users.nim, nims));

  const roleRows = insertedUsers.map((u) => ({
    userId: u.id,
    role: 'admin' as const,
  }));

  console.log(`💾 Granting 'admin' role to ${roleRows.length} users...`);
  await db.insert(userRoles).values(roleRows).onConflictDoNothing();

  console.log('✅ Admin users seeded!');
  await client.end();
}

if (require.main === module) {
  run().catch((err) => {
    console.error('❌ Something went wrong while seeding admin users!', err);
    process.exit(1);
  });
}

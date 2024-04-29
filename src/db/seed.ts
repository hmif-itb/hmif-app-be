import { parse } from 'csv-parse';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createInsertSchema } from 'drizzle-zod';
import fs from 'fs';
import postgres from 'postgres';
import { z } from 'zod';
import { users } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

export async function runUserSeed() {
  const filePath = 'src/db/seed/database.csv';
  const data: Array<typeof users.$inferInsert> = [];

  const dataSchema = createInsertSchema(users, {
    email: z
      .string()
      .email()
      .refine((value) => value.endsWith('@std.stei.itb.ac.id')),
    fullName: z.string(),
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

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const user = dataSchema.parse({
        nim: row[1],
        email: row[6],
        fullName: row[2],
        major: row[3],
        region: row[7],
        angkatan: +row[0],
        gender: row[4],
        membershipStatus: row[5],
      });
      data.push(user);
    })
    .on('end', () => {
      db.insert(users)
        .values(data)
        .then(async () => {
          await client.end();
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .on('error', (err) => {
      console.log(err);
    });
}

if (require.main === module) {
  void runUserSeed();
}

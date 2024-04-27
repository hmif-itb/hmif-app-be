import 'dotenv/config';
import postgres from 'postgres';
import { users } from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import fs from 'fs';
import { parse } from 'csv-parse';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

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
    jurusan: z.enum(['Teknik Informatika', 'Sistem dan Teknologi Informasi']),
    asal_kampus: z.enum(['Ganesha', 'Jatinangor']),
    jenis_kelamin: z.enum(['Laki-laki', 'Perempuan']),
    status_keanggotaan: z.enum([
      'Anggota Biasa',
      'Anggota Kehormatan',
      'Anggota Muda',
    ]),
  });

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const user = dataSchema.parse({
        nim: row[1],
        email: row[6],
        full_name: row[2],
        jurusan: row[3],
        asal_kampus: row[7],
        angkatan: +row[0],
        jenis_kelamin: row[4],
        status_keanggotaan: row[5],
      });
      data.push(user);
    })
    .on('end', () => {
      db.insert(users)
        .values(data)
        .onConflictDoNothing()
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

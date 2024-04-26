import 'dotenv/config';
import postgres from 'postgres';
import { users } from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import fs from 'fs';
import { parse } from 'csv-parse';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

export async function runUserSeed() {
  const filePath = 'src/db/database-anggota-hmif.csv';
  const data: (typeof users.$inferInsert)[] = [];

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      data.push({
        nim: row[1],
        email: row[6],
        full_name: row[2],
        jurusan: row[3],
        asal_kampus: row[7],
        angkatan: row[0],
        jenis_kelamin: row[4],
        status_keanggotaan: row[5],
      });
    })
    .on('end', async () => {
      await db.insert(users).values(data);
      await client.end();
    })
    .on('error', (err) => {
      console.log(err);
    });
}

if (require.main === module) {
  void runUserSeed();
}

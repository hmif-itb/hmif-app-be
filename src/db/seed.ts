import { parse } from 'csv-parse';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createInsertSchema } from 'drizzle-zod';
import fs from 'fs';
import postgres from 'postgres';
import { z } from 'zod';
import { courses, users } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(process.env.DATABASE_URL, { max: 2 });
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
      console.log('📖 Finished reading user CSV file');
      console.log('💾 Started inserting users into database...');
      db.insert(users)
        .values(data)
        .onConflictDoNothing()
        .then(async () => {
          await client.end();
          console.log('✅ Inserted users into database!');
        })
        .catch((err) => {
          console.log('❌ Something went wrong while inserting users!');
          console.log(err);
        });
    })
    .on('error', (err) => {
      console.log('❌ Something went wrong while inserting users!');
      console.log(err);
    });
}

export async function runCourses() {
  const filePath = 'src/db/seed/matakuliah.csv';
  const data: Array<typeof courses.$inferInsert> = [];

  const dataSchema = createInsertSchema(courses);

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const course = dataSchema.parse({
        curriculumYear: +row[0],
        major: row[1],
        semester: +row[2],
        semesterCode: row[3],
        code: row[4],
        name: row[5],
        credits: +row[6],
      });
      data.push(course);
    })
    .on('end', () => {
      console.log('📖 Finished reading matakuliah CSV file');
      console.log('💾 Started inserting courses into database...');
      db.insert(courses)
        .values(data)
        .onConflictDoNothing()
        .then(async () => {
          await client.end();
          console.log('✅ Inserted courses into database!');
        })
        .catch((err) => {
          console.log('❌ Something went wrong while inserting courses!');
          console.log(err);
        });
    })
    .on('error', (err) => {
      console.log('❌ Something went wrong while inserting courses!');
      console.log(err);
    });
}

if (require.main === module) {
  void runUserSeed();
  void runCourses();
}

import { parse } from 'csv-parse';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createInsertSchema } from 'drizzle-zod';
import fs from 'fs';
import postgres from 'postgres';
import { z } from 'zod';
import { angkatan, courses, testimonies, users } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(process.env.DATABASE_URL);
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
        semester: +row[2] || null,
        semesterCode: row[3] || null,
        code: row[4],
        name: row[5],
        credits: +row[6],
        type: row[7],
        dingdongUrl: row[8] || null,
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

export async function runAngkatanSeed() {
  const filePath = 'src/db/seed/angkatan.csv';
  const data: Array<typeof angkatan.$inferInsert> = [];

  const dataSchema = createInsertSchema(angkatan);

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const angkatan = dataSchema.parse({
        year: +row[0],
        name: row[1],
      });
      data.push(angkatan);
    })
    .on('end', () => {
      console.log('📖 Finished reading angkatan CSV file');
      console.log('💾 Started inserting angkatan into database...');
      db.insert(angkatan)
        .values(data)
        .onConflictDoNothing()
        .then(async () => {
          console.log('✅ Inserted angkatan into database!');
        })
        .catch((err) => {
          console.log('❌ Something went wrong while inserting angkatan!');
          console.log(err);
        });
    })
    .on('error', (err) => {
      console.log('❌ Something went wrong while inserting angkatan!');
      console.log(err);
    });
}

export async function runIFTestimoniSeed(file: string) {
  const filePath = 'src/db/seed/' + file;
  let major = '';

  if (file === 'testimoni-if.csv') {
    major = 'IF';
  } else if (file === 'testimoni-sti.csv') {
    major = 'STI';
  }

  const data: Array<typeof testimonies.$inferInsert> = [];
  const coursesList = await db
    .select({ id: courses.id, code: courses.code })
    .from(courses);

  // Map between course code and course id
  const idCourseMap = new Map(
    coursesList.map((course) => [course.code, course.id]),
  );
  const dataSchema = createInsertSchema(testimonies);

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const currentCourseId = idCourseMap.get(row[1]);
      const testimonies = dataSchema.parse({
        userId: row[0] || null,
        courseId: currentCourseId ?? null,
        userName: row[2] || null,
        // STI Testimonies
        impressions: row[3] || null,
        challenges: row[4] || null,
        advice: row[5] || null,

        // IF Testimonies
        overview: row[6] || null,
        assignments: row[7] || null,
        lecturer_review: row[8] || null,

        lecturer: row[9] || null,
      });
      data.push(testimonies);
    })
    .on('end', () => {
      console.log(`📖 Finished reading ${major} testimonies CSV file`);
      console.log(`💾 Started inserting ${major} testimonies into database...`);
      db.insert(testimonies)
        .values(data)
        .onConflictDoNothing()
        .then(async () => {
          await client.end();
          console.log(`✅ Inserted ${major} testimonies into database!`);
        })
        .catch((err) => {
          console.log(
            `❌ Something went wrong while inserting ${major} testimonies!`,
          );
          console.log(err);
        });
    })
    .on('error', (err) => {
      console.log(
        `❌ Something went wrong while inserting ${major} testimonies!`,
      );
      console.log(err);
    });
}

async function runAllSeeds() {
  try {
    await runAngkatanSeed();
    await runUserSeed();
    await runCourses();
    await new Promise((resolve) => setTimeout(resolve, 6000));
    await runIFTestimoniSeed('testimoni-if.csv');
    await runIFTestimoniSeed('testimoni-sti.csv');
  } catch (error) {
    console.log(error);
  }
}

if (require.main === module) {
  void runAllSeeds();
}

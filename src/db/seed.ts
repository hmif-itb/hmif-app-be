import { parse } from 'csv-parse';
import 'dotenv/config';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createInsertSchema } from 'drizzle-zod';
import fs from 'fs';
import postgres from 'postgres';
import { z } from 'zod';
import { rolesGroup } from './roles-group';
import {
  angkatan,
  calendarGroup,
  courses,
  testimonies,
  userRoles,
  users,
  prestasi,
} from './schema';

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

export async function runTestimoniSeed(file: string) {
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
      if (!currentCourseId) {
        console.log('Course not found', row[1]);
        return;
      }
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

export async function runCalendarSeed() {
  const filePath = 'src/db/seed/calendar.csv';
  const data: Array<typeof calendarGroup.$inferInsert> = [];

  const dataSchema = createInsertSchema(calendarGroup);

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const calendarGroup = dataSchema.parse({
        name: row[0],
        category: row[1],
        googleCalendarUrl: row[2],
        code: row[3],
      });
      data.push(calendarGroup);
    })
    .on('end', () => {
      console.log('📖 Finished reading calendar CSV file');
      console.log('💾 Started inserting calendar into database...');
      db.insert(calendarGroup)
        .values(data)
        .onConflictDoNothing()
        .then(async () => {
          console.log('✅ Inserted calendar into database!');
        })
        .catch((err) => {
          console.log('❌ Something went wrong while inserting calendar!');
          console.log(err);
        });
    });
}

function reverseObject<T extends Record<string, string | number>>(
  obj: T,
): Record<string, keyof T> {
  const reversedObj: Record<string, keyof T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      reversedObj[value as string] = key;
    }
  }
  return reversedObj;
}

export async function runRolesGroupSeed() {
  const data: Array<typeof userRoles.$inferInsert> = [];

  const reversedRolesGroup = reverseObject(rolesGroup);

  const filePath = 'src/db/seed/roles-group.csv';
  const columns: Array<{
    nim: string;
    department: string;
    division: string;
  }> = [];

  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', (row) => {
        columns.push({
          department: row[0],
          division: row[1],
          nim: row[2],
        });
      })
      .on('end', () => {
        resolve(null);
      });
  });

  if (columns.length === 0) {
    console.log('No data to insert');
    return;
  }

  const usersList = await db
    .select({ id: users.id, nim: users.nim })
    .from(users)
    .where(
      inArray(
        users.nim,
        columns.map((column) => column.nim),
      ),
    );

  const idUserMap = new Map(usersList.map((user) => [user.nim, user.id]));

  for (const column of columns) {
    const userId = idUserMap.get(column.nim);
    if (!userId) {
      console.log('User not found', column.nim);
      continue;
    }

    if (
      !data.some(
        (item) =>
          item.userId === userId &&
          item.role === reversedRolesGroup[column.department],
      )
    ) {
      data.push({
        userId,
        role: reversedRolesGroup[column.department],
      });
    }

    if (
      column.division &&
      !data.some(
        (item) =>
          item.userId === userId &&
          item.role === reversedRolesGroup[column.division],
      )
    ) {
      data.push({
        userId,
        role: reversedRolesGroup[column.division],
      });
    }
  }

  usersList.forEach((user) => {
    data.push({
      userId: user.id,
      role: 'de',
    });
  });

  await db.insert(userRoles).values(data).onConflictDoNothing();
  console.log('✅ Inserted roles group into database!');
}

export async function seedPrestasi() {
  const filePath = 'src/db/seed/prestasi-seed.csv';

  const usersList = await db.select({ id: users.id, nim: users.nim }).from(users);
  const userMap = new Map(usersList.map((user) => [user.nim, user.id]));

  const dataSchema = z.object({
    userNim: z.string(),
    jenisPrestasi: z.enum(['organisasi', 'kepanitiaan', 'kompetisi']),
    namaPrestasi: z.string(),
    penyelenggara: z.string(),
    tanggalMulai: z.string().transform((val) => new Date(val)),
    tanggalSelesai: z.string().transform((val) => new Date(val)),
    urlSertifikat: z.string().url(),
    urlFotoAwarding: z.string().url().optional().or(z.literal('')),
  });

  const validatedData: Array<typeof prestasi.$inferInsert> = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',', from_line: 2, trim: true }))
      .on('data', (row) => {
        try {
          const parsedRow = dataSchema.parse({
            userNim: row[0],
            jenisPrestasi: row[1],
            namaPrestasi: row[2],
            penyelenggara: row[3],
            tanggalMulai: row[4],
            tanggalSelesai: row[5],
            urlSertifikat: row[6],
            urlFotoAwarding: row[7],
          });

          const userId = userMap.get(parsedRow.userNim);

          if (!userId) {
            console.log(`User not found ${parsedRow.userNim}, skipping row.`);
            return;
          }

          validatedData.push({
            userId: userId,
            jenisPrestasi: parsedRow.jenisPrestasi,
            namaPrestasi: parsedRow.namaPrestasi,
            penyelenggara: parsedRow.penyelenggara,
            tanggalMulai: parsedRow.tanggalMulai,
            tanggalSelesai: parsedRow.tanggalSelesai,
            urlSertifikat: parsedRow.urlSertifikat,
            urlFotoAwarding: parsedRow.urlFotoAwarding || null,
          });
        } catch (error) {
          console.log('❌ Error parsing row:', row, error);
        }
      })
      .on('end', () => {
        console.log('📖 Finished reading prestasi CSV file.');
        resolve(null); 
      })
      .on('error', (err) => {
        console.log('❌ Something went wrong while reading prestasi CSV file!');
        reject(err);
      });
  });

  if (validatedData.length === 0) {
    console.log('No prestasi data to insert.');
    return;
  }

  console.log(`💾 Started inserting ${validatedData.length} prestasi into database...`);
  try {
    await db.insert(prestasi).values(validatedData).onConflictDoNothing();
    console.log('✅ Inserted prestasi into database!');
  } catch (err) {
    console.log('❌ Something went wrong while inserting prestasi!');
    console.log(err);
  }
}

async function runAllSeeds() {
  try {
    await runAngkatanSeed();
    await runUserSeed();
    await runCourses();
    await new Promise((resolve) => setTimeout(resolve, 6000));
    // await runTestimoniSeed('testimoni-if.csv'); // File doesn't exist
    // await runTestimoniSeed('testimoni-sti.csv'); // File doesn't exist
    // await runCalendarSeed(); // File doesn't exist
    await seedPrestasi();
    // await runRolesGroupSeed(); // Commented out until you have the real user data
  } catch (error) {
    console.log(error);
  }
}

if (require.main === module) {
  void runAllSeeds();
}

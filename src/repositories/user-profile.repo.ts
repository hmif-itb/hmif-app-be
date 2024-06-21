import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { users } from '~/db/schema';
import { getCurrentSemesterCodeAndYear } from './course.repo';


export async function getUserAcademic(db: Database, userId: string) {
  var semester
  const user =  await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  const {semesterCodeTaken, semesterYearTaken} = getCurrentSemesterCodeAndYear()
  if (semesterCodeTaken === "Genap") {
    semester = 2 * (semesterYearTaken - user!.angkatan + 1);
  } else {
      semester = 2 * (semesterYearTaken - user!.angkatan) + 1;
  }
  return {semester, semesterCodeTaken, semesterYearTaken}

}

export async function getUserProfile(db: Database, userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}
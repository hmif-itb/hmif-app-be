import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { getCurrentSemesterCodeAndYear } from './course.repo';
import { JWTPayloadSchema } from '~/types/login.types';

export async function getUserAcademic(
  db: Database,
  user: z.infer<typeof JWTPayloadSchema>,
) {
  const { semesterCodeTaken, semesterYearTaken } =
    getCurrentSemesterCodeAndYear();
  const semester =
    semesterCodeTaken === 'Genap'
      ? 2 * (semesterYearTaken - user.angkatan + 1) // Kalo semester genap
      : 2 * (semesterYearTaken - user.angkatan) + 1; // Kalo semester ganjil

  return { semester, semesterCodeTaken, semesterYearTaken };
}

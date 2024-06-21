import { createSelectSchema } from 'drizzle-zod';
import { users } from '~/db/schema';
import { z } from 'zod';

export const UserProfileSchema = createSelectSchema(users, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('User');

export const UserAcademicSchema = z.object({
  semester: z.number().optional().openapi({
    example: 6,
  }),
  semesterYear: z.number().openapi({
    example: 2023,
  }),
  semesterCode: z.enum(['Ganjil', 'Genap']).openapi({
    example: 'Ganjil',
  }),
});

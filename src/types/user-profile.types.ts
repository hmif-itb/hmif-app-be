import { z } from 'zod';
import { JWTPayloadSchema } from './login.types';

export const UserProfileSchema = JWTPayloadSchema;

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

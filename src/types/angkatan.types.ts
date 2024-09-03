import { createSelectSchema } from 'drizzle-zod';
import { angkatan } from '~/db/schema';

export const AngkatanSchema = createSelectSchema(angkatan).openapi('Angkatan');

export const ListAngkatanSchema = AngkatanSchema.array();

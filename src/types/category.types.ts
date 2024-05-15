import { createSelectSchema } from 'drizzle-zod';
import { categories } from '~/db/schema';

export const CategorySchema = createSelectSchema(categories);

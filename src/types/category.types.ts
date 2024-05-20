import { createSelectSchema } from 'drizzle-zod';
import { categories } from '~/db/schema';
import { z } from 'zod';

export const CategorySchema = createSelectSchema(categories);

export const CategoryNotFoundSchema = createSelectSchema(categories, {
  id: z.string(),
  name: z.null(),
  requiredPush: z.null(),
});

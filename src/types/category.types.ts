import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { categories } from '~/db/schema';

export const CategorySchema = createSelectSchema(categories);

export const ListCategorySchema = z.object({
  categories: z.array(CategorySchema),
});

export const CategoryParamSchema = z.object({
  categoryId: z.string(),
});

export const CategoryNotFoundSchema = createSelectSchema(categories, {
  id: z.string(),
  name: z.null(),
  requiredPush: z.null(),
});

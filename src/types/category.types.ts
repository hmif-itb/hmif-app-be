import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { categories } from '~/db/schema';

export const CategorySchema = createSelectSchema(categories);

export const ListCategorySchema = z.object({
  categories: z.array(CategorySchema),
});

export const CategoryParamSchema = createInsertSchema(categories)
  .pick({
    id: true,
  })
  .required();

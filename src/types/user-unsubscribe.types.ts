import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userUnsubscribeCategories } from '~/db/schema';

export const GetUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
);

export const GetListUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
  {
    categoryId: z.array(z.string()),
  },
);

export const GetUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.string().openapi({ example: '1' }),
});

export const PostUserUnsubscribeCategorySchema = createInsertSchema(
  userUnsubscribeCategories,
);

export const PostListUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
  {
    categoryId: z.array(z.string()).openapi({ example: ['1', '2', '3'] }),
  },
);

export const PostUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.string(),
});

// TODO: ADD DELETE METHODS TYPES

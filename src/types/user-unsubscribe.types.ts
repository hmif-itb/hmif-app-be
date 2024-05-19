import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userUnsubscribeCategories } from '~/db/schema';

export const GetUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
  {
    userId: z.string().openapi({ example: '1456cdef' }),
    categoryId: z.string().openapi({ example: '1' }),
  },
);

export const GetListUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
  {
    userId: z.string().openapi({ example: '1456cdef' }),
    categoryId: z.array(z.string()).openapi({ example: ['1', '2', '3'] }),
  },
);

export const GetUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.string().openapi({ example: '1' }),
});

export const PostUserUnsubscribeCategorySchema = createInsertSchema(
  userUnsubscribeCategories,
  {
    userId: z.string().openapi({ example: '1456cdef' }),
    categoryId: z.string().openapi({ example: '1' }),
  },
);

export const PostListUserUnsubscribeCategorySchema = createInsertSchema(
  userUnsubscribeCategories,
  {
    userId: z.string().openapi({ example: '12345abcd' }),
    categoryId: z.array(z.string()).openapi({ example: ['1', '2', '3'] }),
  },
);

export const PostUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.string().openapi({ example: '1' }),
});

export const PostListUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.array(z.string()).openapi({ example: ['1', '2', '3'] }),
});

export const DeleteUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
  {
    userId: z.string().openapi({ example: '1456cdef' }),
    categoryId: z.string().openapi({ example: '1' }),
  },
);

export const DeleteListUserUnsubscribeCategorySchema = createSelectSchema(
  userUnsubscribeCategories,
  {
    userId: z.string().openapi({ example: '12345abcd' }),
    categoryId: z.array(z.string()).openapi({ example: ['1', '2', '3'] }),
  },
);

export const DeleteUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.string().openapi({ example: '1' }),
});

export const DeleteListUserUnsubscribeCategoryParamsSchema = z.object({
  categoryId: z.array(z.string()).openapi({ example: ['1', '2', '3'] }),
});

// Response types
export const GetUserUnsubscribeCategoryResponseSchema = z.object({
  ...GetUserUnsubscribeCategorySchema.shape,
  unsubscribed: z.boolean(),
});

export const PostListUserUnsubscribeCategoryResponseSchema = z.object({
  ...PostListUserUnsubscribeCategorySchema.shape,
  requiredSubscriptions: z.array(z.string()).openapi({
    example: ['1', '2'],
  }),
  categoriesNotFound: z.array(z.string()).openapi({
    example: ['3', '4'],
  }),
  categoriesAlreadyUnsubscribed: z.array(z.string()).openapi({
    example: ['5', '6'],
  }),
});

export const DeleteListUserUnsubscribeCategoryResponseSchema = z.object({
  ...DeleteListUserUnsubscribeCategorySchema.shape,
  categoriesNotFound: z.array(z.string()).openapi({
    example: ['3', '4'],
  }),
  categoriesAlreadySubscribed: z.array(z.string()).openapi({
    example: ['5', '6'],
  }),
});

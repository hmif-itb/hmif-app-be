import { z } from '@hono/zod-openapi';

export const ListInfoParamsSchema = z.object({
    search: z
      .string()
      .min(0)
      .openapi({
        param: {
          name: 'search',
          in: 'path',
        },
        example: '',
      }),
    category: z
      .string()
      .min(3)
      .openapi({
        param: {
          name: 'category',
          in: 'path',
        },
        example: 'cat',
      }),
      isRead: z
      .string()
      .min(4)
      .openapi({
        param: {
          name: 'isRead',
          in: 'path',
        },
        example: 'true',
      }),
  });

export const ListInfoSchema = z.object({
    search: z
      .string()
      .min(0)
      .openapi({
        param: {
          name: 'search',
          in: 'path',
        },
        example: '',
      }),
    category: z
      .string()
      .min(3)
      .openapi({
        param: {
          name: 'category',
          in: 'path',
        },
        example: 'cat',
      }),
      isRead: z
      .string()
      .min(4)
      .openapi({
        param: {
          name: 'isRead',
          in: 'path',
        },
        example: 'true',
      }),
  });

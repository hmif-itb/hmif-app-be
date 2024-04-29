import { z } from '@hono/zod-openapi';
import { infoMedias } from '~/db/schema';

export const ListInfoParamsSchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'search',
        in: 'query',
      },
      example: 'content',
    }),
  category: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'category',
        in: 'query',
      },
      example: 'cat',
    }),
  isRead: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'isRead',
        in: 'query',
      },
      example: 'true',
    }),
  userId: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'isRead',
        in: 'query',
      },
      example: 'uuid',
    }),
});

export const InfoSchema = z
  .object({
    id: z.string().openapi({
      example: '123',
    }),
    creatorId: z.string().nullable().openapi({
      example: '456',
    }),
    category: z.string().nullable().openapi({
      example: 'ujian',
    }),
    forAngkatan: z.number().nullable().openapi({
      example: 22,
    }),
    forMatakuliah: z.string().nullable().openapi({
      example: 'RPL',
    }),
    forClass: z.string().nullable().openapi({
      example: 'K1',
    }),
    createdAt: z.string().openapi({
      example: '2024-04-28T17:43:57.516Z',
    }),
  })
  .openapi('ListInfo');

export const ListInfoSchema = z.object({
  infos: z.array(InfoSchema),
});

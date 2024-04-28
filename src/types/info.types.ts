import { z } from '@hono/zod-openapi';
import { infoMedias } from '~/db/schema';

export const ListInfoParamsSchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'search',
        in: 'path',
      },
      example: '',
    }),
  category: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'category',
        in: 'path',
      },
      example: 'cat',
    }),
  isRead: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'isRead',
        in: 'path',
      },
      example: 'true',
    }),
  userId: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'isRead',
        in: 'path',
      },
      example: 'uuid',
    }),
});

export const ListInfoSchema = z
  .object({
    id: z.string().openapi({
      example: '123',
    }),
    creatorId: z.string().openapi({
      example: '456',
    }),
    category: z.string().openapi({
      example: 'ujian',
    }),
    forAngkatan: z.string().openapi({
      example: '22',
    }),
    forMatakuliah: z.string().openapi({
      example: 'RPL',
    }),
    forClass: z.string().openapi({
      example: 'K1',
    }),
    createdAt: z.string().openapi({
      example: '2024-04-28T17:43:57.516Z',
    }),
  })
  .openapi('ListInfo');

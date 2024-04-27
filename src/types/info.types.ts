import { z } from '@hono/zod-openapi';

export const InfoParamSchema = z.object({
  content: z.string().openapi({
    param: {
      name: 'content',
      in: 'query',
      required: true,
    },
    example: 'Hello World',
  }),
  category: z.string().openapi({
    param: {
      name: 'category',
      in: 'query',
      required: true,
    },
    example: 'Pengumuman',
  }),
  forAngkatan: z
    .number()
    .int()
    .openapi({
      param: {
        name: 'forAngkatan',
        in: 'query',
        required: true,
      },
      example: 21,
    }),
  mediaIds: z.array(z.string()).openapi({
    param: {
      name: 'media_ids',
      in: 'query',
    },
    example: ['1', '2'],
  }),
  forMatakuliah: z.string().openapi({
    param: {
      name: 'forMatakuliah',
      in: 'query',
    },
    example: 'Pemrograman Web',
  }),
  forClass: z.string().openapi({
    param: {
      name: 'forClass',
      in: 'query',
    },
    example: 'K1',
  }),
});

export const InfoSchema = z
  .object({
    id: z.string().openapi({
      example: '123',
    }),
    creatorId: z.string().openapi({
      example: '123',
    }),
    content: z.string().openapi({
      example: 'Hello World',
    }),
    forAngkatan: z.number().int().openapi({
      example: 21,
    }),
    forMatakuliah: z.string().openapi({
      example: 'Pemrograman Web',
    }),
    forClass: z.number().int().openapi({
      example: 1,
    }),
    createdAt: z.string().openapi({
      example: '2021-01-01T00:00:00Z',
    }),
  })
  .openapi('Info');

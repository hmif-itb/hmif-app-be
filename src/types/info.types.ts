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
  forClass: z
    .number()
    .int()
    .openapi({
      param: {
        name: 'forClass',
        in: 'query',
      },
      example: 1,
    }),
});

export const InfoSchema = z
  .object({
    id: z.string(),
    creatorId: z.string().nullable(),
    content: z.string(),
    category: z.string(),
    forAngkatan: z.number().int().nullable(),
    forMatakuliah: z.string().nullable(),
    forClass: z.number().int().nullable(),
    createdAt: z.string(),
  })
  .openapi('Info');

export const CreateReadRequestBodySchema = z.object({
  infoId: z.string(),
});

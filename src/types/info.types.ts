import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { infos } from '~/db/schema';

export const InfoParamSchema = z.object({
  content: z.string().openapi({
    example: 'Tutor Sebaya dengan Dr. Asep Spakbor',
  }),
  category: z.string().openapi({
    example: 'Akademik',
  }),
  forAngkatan: z.number().int().openapi({
    example: 2021,
  }),
  mediaUrls: z
    .array(z.string().url())
    .optional()
    .openapi({
      example: [
        'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/r176r3qcuqs3hg8o3dm93n35-asrielblunt.jpg',
        'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/ba245cbm4238trmq4zv5kkif-semester-cat.png',
      ],
    }),
  forMatakuliah: z.string().openapi({
    example: 'II2111 Algoritma dan Struktur Data STI',
  }),
  forClass: z.string().openapi({
    example: 'K01',
  }),
});

export const InfoSchema = createSelectSchema(infos, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Info');

export const CreateReadRequestBodySchema = z.object({
  infoId: z.string(),
});

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

// export const InfoSchema = z
//   .object({
//     id: z.string().openapi({
//       example: '123',
//     }),
//     creatorId: z.string().nullable().openapi({
//       example: '456',
//     }),
//     category: z.string().nullable().openapi({
//       example: 'ujian',
//     }),
//     forAngkatan: z.number().nullable().openapi({
//       example: 22,
//     }),
//     forMatakuliah: z.string().nullable().openapi({
//       example: 'RPL',
//     }),
//     forClass: z.string().nullable().openapi({
//       example: 'K1',
//     }),
//     createdAt: z.string().openapi({
//       example: '2024-04-28T17:43:57.516Z',
//     }),
//   })
//   .openapi('ListInfo');

export const ListInfoSchema = z.object({
  infos: z.array(InfoSchema),
});

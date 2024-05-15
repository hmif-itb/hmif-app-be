import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { infos } from '~/db/schema';

export const InfoSchema = createSelectSchema(infos, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Info');

export const CreateInfoForCoursesFieldItemSchema = z.object({
  courseId: z.string(),
  class: z.number().optional(),
});

export const CreateInfoBodySchema = createInsertSchema(infos)
  .omit({
    id: true,
    creatorId: true,
    createdAt: true,
  })
  .extend({
    mediaUrls: z
      .array(z.string().url())
      .optional()
      .openapi({
        example: [
          'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/r176r3qcuqs3hg8o3dm93n35-asrielblunt.jpg',
          'https://deleteMediaUrlsFieldIfNoMediaUrls.dev',
        ],
      }),
    forCategories: z.array(z.string()).openapi({
      example: ['categoryId1', 'categoryId2'],
    }),
    forAngkatan: z
      .array(z.string())
      .optional()
      .openapi({
        example: ['angkatanId1', 'deleteForAngkatanFieldIfWantToAllAngkatan'],
      }),
    forCourses: z
      .array(CreateInfoForCoursesFieldItemSchema)
      .optional()
      .openapi({
        example: [
          {
            courseId: 'deleteForCoursesFieldIfNoCourses',
            class: 1,
          },
          {
            courseId: 'deleteClassFieldIfWantToAllClass',
          },
        ],
      }),
  });

export const CreateReadRequestBodySchema = z.object({
  infoId: z.string(),
});

export const InfoIdParamsSchema = z.object({
  infoId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of info',
      example: 'uuid',
    },
  }),
});

export const ListInfoParamsSchema = z.object({
  search: z.string().optional().openapi({
    example: 'content',
  }),
  category: z.string().optional().openapi({
    example: 'cat',
  }),
  unread: z.enum(['true', 'false']).default('false').openapi({
    example: 'true',
  }),
  userId: z.string().optional().openapi({
    example: 'uuid',
  }),
  offset: z.coerce.number().int().nonnegative().optional().openapi({
    example: 10,
  }),
});

export const ListInfoSchema = z.object({
  infos: z.array(InfoSchema),
});

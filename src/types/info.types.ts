import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  infoAngkatan,
  infoCategories,
  infoCourses,
  infoMedias,
  infos,
} from '~/db/schema';
import { AngkatanSchema } from './angkatan.types';
import { CategorySchema } from './category.types';
import { CourseSchema } from './course.types';
import { JWTPayloadSchema } from './login.types';
import { MediaSchema } from './media.types';
import { ReactionResponseSchema } from './reaction.types';
import { UserGroupSchema } from './user.types';

export const InfoCategorySchema = createSelectSchema(infoCategories).extend({
  category: CategorySchema,
});

export const InfoMediaSchema = createSelectSchema(infoMedias).extend({
  media: MediaSchema,
});

export const InfoAngkatanSchema = createSelectSchema(infoAngkatan).extend({
  angkatan: AngkatanSchema,
});

export const InfoCourseSchema = createSelectSchema(infoCourses).extend({
  course: CourseSchema,
});

export const InfoSchema = createSelectSchema(infos, {
  createdAt: z.union([z.string(), z.date()]),
})
  .omit({
    isForAngkatan: true,
    isForGroups: true,
  })
  .extend({
    infoMedias: z.array(InfoMediaSchema).optional(),
    infoCategories: z.array(InfoCategorySchema).optional(),
    infoCourses: z.array(InfoCourseSchema).optional(),
    infoAngkatan: z.array(InfoAngkatanSchema).optional(),
    infoGroups: z.array(UserGroupSchema).optional(),
    comments: z.number(),
    reactions: ReactionResponseSchema,
    creator: JWTPayloadSchema,
    isRead: z.boolean().optional(),
    canNotify: z.boolean().optional(),
    isForAngkatan: z.boolean().optional(),
    isForGroups: z.boolean().optional(),
  })
  .openapi('Info');

export const CreateInfoForCoursesFieldItemSchema = z.object({
  courseId: z.string(),
  class: z.number().optional(),
});

export const CreateInfoBodySchema = createInsertSchema(infos)
  .omit({
    id: true,
    creatorId: true,
    createdAt: true,
    isForAngkatan: true,
    isForGroups: true,
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
    forCategories: z
      .array(z.string())
      .min(1)
      .openapi({
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
    forGroups: z
      .array(z.string())
      .optional()
      .openapi({
        example: ['role1', 'role2'],
      }),
  });

export const CreateReadRequestBodySchema = z.object({
  unread: z.boolean().optional(),
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
  excludeCategory: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .openapi({
      example: ['cat1', 'cat2'],
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
  sort: z.enum(['oldest', 'newest']).default('newest').openapi({
    example: 'newest',
  }),
});

export const ListInfoSchema = z.object({
  infos: z.array(InfoSchema),
});

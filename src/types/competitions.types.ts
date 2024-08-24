import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { competitionMedias, competitions } from '~/db/schema';
import { addHours } from './calendar.types';
import { MediaSchema } from './media.types';

export const CompetitionMediaSchema = createSelectSchema(
  competitionMedias,
).extend({
  media: MediaSchema,
});

export const CompetitionSchema = createSelectSchema(competitions, {
  registrationStart: z.union([z.string(), z.date()]),
  registrationDeadline: z.union([z.string(), z.date()]),
  createdAt: z.union([z.string(), z.date()]),
}).extend({
  medias: z.array(CompetitionMediaSchema).optional(),
});

export const CreateCompetitionSchema = createInsertSchema(competitions, {
  registrationStart: z.coerce
    .date()
    .openapi({ example: new Date().toISOString() }),
  registrationDeadline: z.coerce.date().openapi({
    example: addHours(new Date(), 2).toISOString(),
  }),
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
  })
  .omit({
    id: true,
    createdAt: true,
  });

export const UpdateCompetitionBodySchema = createInsertSchema(competitions, {
  registrationStart: z.coerce.date().openapi({
    example: new Date().toISOString(),
  }),
  registrationDeadline: z.coerce.date().openapi({
    example: addHours(new Date(), 2).toISOString(),
  }),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  organizer: z
    .string()
    .min(3, { message: 'Organizer must be at least 3 characters' }),
  sourceUrl: z.string().url({ message: 'Invalid URL' }).openapi({
    example: 'https://example.com',
  }),
  registrationUrl: z.string().url({ message: 'Invalid URL' }).openapi({
    example: 'https://example.com',
  }),
  price: z.string().min(3, { message: 'Price must be at least 3 characters' }),
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
  })
  .partial()
  .omit({
    id: true,
    createdAt: true,
  });

export const UpdateCompetitionParamsSchema = z.object({
  id: z.string().min(1, { message: 'Required ID' }),
});

export const CompetitionsSchema = createSelectSchema(competitions, {
  createdAt: z.union([z.string(), z.date()]),
  registrationStart: z.union([z.string(), z.null()]),
  registrationDeadline: z.union([z.string(), z.null()]),
});

export const ListCompetitionsSchema = z.object({
  competitions: z.array(CompetitionsSchema),
});

export const CompetitionListQuerySchema = z.object({
  filter: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'query',
        description: 'is active or not',
        example: 'active',
      },
    }),
  sort: z
    .enum(['created', 'deadline'])
    .optional()
    .default('created')
    .openapi({
      param: {
        in: 'query',
        description: 'Sort info competitions',
        example: 'created',
      },
    }),
  category: z
    .enum(competitions.type.enumValues)
    .optional()
    .openapi({
      param: {
        in: 'query',
        description: 'category info competitions',
        example: 'Web Development',
      },
    }),
  offset: z.coerce.number().int().nonnegative().optional().openapi({
    example: 10,
  }),
});

export const CompetitionsIdParamSchema = z.object({
  competitionId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of fetched/deleted competitions',
      example: '1',
    },
  }),
});

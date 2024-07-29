import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { competitions } from '~/db/schema';

export const CompetitionsSchema = createSelectSchema(competitions, {
  createdAt: z.union([z.string(), z.date()]),
});

export const ListCompetitionsSchema = z.object({
  competitions: z.array(CompetitionsSchema),
});

export const CompetitionListQuerySchema = z.object({
    filter: z.string().optional().openapi({
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
      .enum([
        'Competitive Programming',
        'Capture The Flag',
        'Data Science / Data Analytics',
        'UI/UX',
        'Game Development',
        'Business IT Case',
        'Innovation',
        'Web Development',
      ])
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